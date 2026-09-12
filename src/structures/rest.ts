import { TokenBucket } from "@utils/limiter";
import { isDOMException, isErrnoException } from "@utils/error";
import { generateApiSignature } from "@utils/crypto";
import { RequestMethod } from "@local-types/rest";
import { Events } from "@local-types/client";

import type {
  InternalRequest,
  APIResponse,
  APIMethod,
  RequestData,
  APIErrorPayload,
  FetchOptions,
} from "@local-types/rest";
import type { LastFmClient } from "@/client";
import type { RequestFailedPayload } from "@/types/client";

const ERROR_CODE_RATE_LIMIT = 29;
const ERROR_CODE_SERVICE_OFFLINE = 11;
const ERROR_CODE_SERVICE_UNAVAILABLE = 16;
const ERROR_CODE_INVALID_SESSION = 9;

export class REST {
  readonly #client: LastFmClient;
  readonly #baseUrl: string;
  readonly #retries: number;
  readonly #bucket: TokenBucket;

  public constructor(client: LastFmClient) {
    this.#client = client;
    this.#baseUrl = `https://ws.audioscrobbler.com/2.0/`;
    this.#retries = client.config.network.retries;
    this.#bucket = new TokenBucket({ ...client.config.rateLimit });
  }

  /**
   * Get the length of the request queue.
   */
  public get requestQueueLength(): number {
    return this.#bucket.queueLength;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // #endregion
  // #region Public Methods
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Clears all pending unresolved promises from the token bucket queue.
   */
  public clearRequestQueue(): void {
    this.#bucket.clearQueue();
  }

  /**
   * Runs a get request from the API.
   *
   * @param apiMethod - The API method.
   * @param options - The request options. See {@link RequestData}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, data: T }`
   * - **Failure**: `{ success: false, errorCode: number | string, errorMsg: string }`
   */
  public async get<T>(apiMethod: APIMethod, options: RequestData): Promise<APIResponse<T>> {
    return this.#request({ ...options, apiMethod, method: RequestMethod.GET, retries: this.#retries });
  }

  /**
   * Runs a post request from the API.
   *
   * @param apiMethod - The API method.
   * @param options - The request options. See {@link RequestData}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, data: T }`
   * - **Failure**: `{ success: false, errorCode: number | string, errorMsg: string }`
   */
  public async post<T>(apiMethod: APIMethod, options: RequestData): Promise<APIResponse<T>> {
    return this.#request({ ...options, apiMethod, method: RequestMethod.POST, retries: this.#retries });
  }

  /**
   * Orchestrates the request, delegating response parsing and error handling.
   *
   * @param options - The request options. See {@link InternalRequest}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, data: T }`
   * - **Failure**: `{ success: false, errorCode: number | string, errorMsg: string }`
   */
  async #request<T>(options: InternalRequest): Promise<APIResponse<T>> {
    try {
      await this.#bucket.wait();

      const { url, fetchOptions } = this.#buildFetchOptions(options);
      const response = await fetch(url, fetchOptions);

      return await this.#handleResponse<T>(response, options);
    } catch (error) {
      return await this.#handleError<T>(error, options);
    }
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // #endregion
  // #region Response handling
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Entry point for turning a raw `Response` into an `APIResponse`.
   * Inspects the parsed payload shape and delegates to the handler below
   * that matches (malformed / API error / HTTP error / success).
   */
  async #handleResponse<T>(response: Response, options: InternalRequest): Promise<APIResponse<T>> {
    const json = await this.#parseJsonSafely(response);

    if (!json || typeof json !== "object") {
      return this.#handleMalformedResponse<T>(json, options);
    }

    const payload = json as APIErrorPayload;

    if ("error" in payload) {
      return this.#handleApiError<T>(payload, options);
    }

    if (!response.ok || payload.syntaxError) {
      return this.#handleHttpError<T>(response, payload, options);
    }

    return { success: true, data: json as T };
  }

  /**
   * Handles responses that aren't valid JSON objects at all.
   */
  #handleMalformedResponse<T>(json: unknown, options: InternalRequest): APIResponse<T> {
    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      message: `Malformed Response: ${typeof json}`,
      willRetry: false,
    });

    return { success: false, errorCode: "BAD_RESPONSE", errorMsg: "Received malformed response from Last.fm" };
  }

  /**
   * Handles Last.fm's `{ error, message }` payloads (codes 29, 11, 16, 9, etc).
   */
  async #handleApiError<T>(json: APIErrorPayload, options: InternalRequest): Promise<APIResponse<T>> {
    const { apiMethod, retries, meta = {} } = options;

    const error = typeof json.error === "number" ? json.error : 8;
    const message = typeof json.message === "string" ? json.message : "An unknown error occurred.";

    const isTransient =
      // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
      error === ERROR_CODE_RATE_LIMIT ||
      error === ERROR_CODE_SERVICE_OFFLINE ||
      error === ERROR_CODE_SERVICE_UNAVAILABLE;

    if (isTransient && retries > 0) {
      return this.#handleTransientApiError<T>(error, message, options);
    }

    if (error === ERROR_CODE_INVALID_SESSION) {
      this.#client.emit(
        Events.SESSION_EXPIRE,
        `[${apiMethod}]: (9) Invalid session key - Please re-authenticate`,
        meta,
      );
    }

    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      message: `(${error}) ${message}`,
      willRetry: false,
    });

    return { success: false, errorCode: error, errorMsg: message };
  }

  /**
   * Handles the retry/backoff logic for transient Last.fm error codes (29, 11, 16).
   */
  async #handleTransientApiError<T>(error: number, message: string, options: InternalRequest): Promise<APIResponse<T>> {
    const { retries } = options;
    const { backOffBaseMs, backOffOutageBaseMs } = this.#client.config.rateLimit;
    const { onRateLimit, onServiceOutage } = this.#client.config.network.retryStrategy;

    const isRateLimit = error === ERROR_CODE_RATE_LIMIT;
    const baseDelayMs = isRateLimit ? backOffBaseMs : backOffOutageBaseMs;
    const shouldRetry = isRateLimit ? onRateLimit : onServiceOutage;
    const type = isRateLimit ? "ratelimit" : "error";

    const exponentialDelay = baseDelayMs * Math.pow(2, this.#getAttempt(retries));
    const backOffMs = Math.floor(Math.random() * exponentialDelay);

    const errorMessage = `(${error}) ${message}. ${shouldRetry ? `Retry in` : `Backing off`} ${backOffMs}ms`;

    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      type,
      message: errorMessage,
      willRetry: shouldRetry,
    });

    this.#bucket.applyBackoff(backOffMs);

    if (shouldRetry) {
      return this.#request({ ...options, retries: retries - 1 });
    }

    return { success: false, errorCode: error, errorMsg: errorMessage };
  }

  /**
   * Handles non-2xx HTTP responses and unparsable (HTML/etc) payloads.
   */
  #handleHttpError<T>(response: Response, json: APIErrorPayload, options: InternalRequest): APIResponse<T> {
    const failureType = json.syntaxError ? "Invalid JSON/HTML payload" : "HTTP error";
    const { status, statusText } = response;

    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      message: `${failureType} (${status}) ${statusText}`,
      willRetry: false,
    });

    return { success: false, errorCode: status, errorMsg: statusText };
  }

  /**
   * Catches JSON parsing errors safely to prevent unhandled crashing.
   */
  async #parseJsonSafely(result: Response): Promise<unknown> {
    return (await result.json().catch((error: unknown) => {
      if (error instanceof SyntaxError) return { syntaxError: true };
      throw error;
    })) as unknown;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // #endregion
  // #region Error handling (network/fetch failures, not API-level errors)
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Handles and categorizes thrown errors and timeouts.
   */
  async #handleError<T>(error: unknown, options: InternalRequest): Promise<APIResponse<T>> {
    const rejection = this.#handleQueueRejection<T>(error);
    if (rejection) return rejection;

    const { errorCode, isTimeout, shouldRetry } = this.#categorizeError(error);

    if (shouldRetry && options.retries > 0) {
      return this.#retryAfterNetworkError<T>(errorCode, options);
    }

    const normalizedErrorMessage = error instanceof Error ? error.message : String(error);

    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      message: normalizedErrorMessage,
      willRetry: false,
    });

    return { success: false, errorCode, errorMsg: `${isTimeout ? "Network error" : "Error"} (${errorCode})` };
  }

  /**
   * Short-circuits when the TokenBucket itself rejected the request and rejection-emitting is disabled.
   */
  #handleQueueRejection<T>(error: unknown): APIResponse<T> | null {
    const shouldEmitOnRejected = this.#client.config.behavior.emitRequestFailedOnReject;
    const normalizedErrorMessage = error instanceof Error ? error.message : String(error);

    if (!shouldEmitOnRejected && normalizedErrorMessage.startsWith("[TokenBucket]")) {
      return { success: false, errorCode: "REJECTED", errorMsg: normalizedErrorMessage };
    }

    return null;
  }

  /**
   * Determines the normalized error code and whether it represents a retryable timeout.
   */
  #categorizeError(error: unknown): { errorCode: string; isTimeout: boolean; shouldRetry: boolean } {
    // prettier-ignore
    const errorCode = isErrnoException(error) ? (error.code ?? error.name) : (isDOMException(error) ? error.name : "UNKNOWN");

    // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
    const isTimeout = errorCode === "TimeoutError" || errorCode === "ETIMEDOUT" || errorCode === "AbortError";
    const shouldRetry = isTimeout && this.#client.config.network.retryStrategy.onTimeout;

    return { errorCode, isTimeout, shouldRetry };
  }

  /**
   * Emits the retry event and re-issues the request for a retryable network error.
   */
  async #retryAfterNetworkError<T>(errorCode: string, options: InternalRequest): Promise<APIResponse<T>> {
    this.#client.emit(Events.REQUEST_FAILED, {
      ...this.#buildFailurePayload(options),
      message: `Network issue (${errorCode}). Retrying...`,
      willRetry: true,
    });

    return this.#request({ ...options, retries: options.retries - 1 });
  }

  /**
   * Builds the `requestFailed` payload fields shared by every failure path.
   */
  #buildFailurePayload(options: InternalRequest): Omit<RequestFailedPayload, "message" | "willRetry"> {
    return {
      apiMethod: options.apiMethod,
      type: "error" as const,
      attempt: this.#getAttempt(options.retries),
      queueSize: this.requestQueueLength,
    };
  }

  #getAttempt(retries: number): number {
    return this.#retries - retries + 1;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // #endregion
  // #region Request building
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Builds the URL, headers, body, and abort signal for a fetch call.
   */
  #buildFetchOptions(options: InternalRequest): FetchOptions {
    const parameters = this.#encodeUrlParams(options);
    const isPost = options.method === RequestMethod.POST;

    const url = isPost ? this.#baseUrl : `${this.#baseUrl}?${parameters}`;

    const fetchOptions: RequestInit = {
      method: options.method,
      body: this.#buildBody(options.method, parameters),
      headers: this.#buildHeaders(options, isPost),
      signal: AbortSignal.timeout(this.#client.config.network.abortTimeoutMs),
    };

    return { url, fetchOptions };
  }

  /**
   * Merges caller-supplied headers with the content-type (POST only) and the User-Agent.
   */
  #buildHeaders(options: InternalRequest, isPost: boolean): HeadersInit {
    const contentTypeHeader: HeadersInit = isPost ? { "Content-Type": "application/x-www-form-urlencoded" } : {};

    return {
      ...options.headers,
      ...contentTypeHeader,
      "User-Agent": this.#client.config.api.userAgent,
    };
  }

  /**
   * GET/HEAD requests carry no body; everything else sends the encoded params.
   */
  #buildBody(method: RequestMethod, parameters: string): BodyInit | null {
    return ["GET", "HEAD"].includes(method) ? null : parameters;
  }

  /**
   * Formats parameters, appends global keys, and signs requests when required.
   */
  #encodeUrlParams(options: InternalRequest): string {
    const signatureBaseParameters = {
      ...this.#normalizeParams(options.params),
      method: options.apiMethod,
      api_key: this.#client.config.api.key,
    };

    const finalParameters: Record<string, string> = {
      ...signatureBaseParameters,
      format: "json",
    };

    if (options.signature) {
      finalParameters.api_sig = generateApiSignature({
        secret: this.#client.config.api.secret,
        params: signatureBaseParameters,
      });
    }

    return new URLSearchParams(finalParameters).toString();
  }

  /**
   * Stringifies all param values so they're safe for `URLSearchParams`.
   */
  #normalizeParams(parameters: InternalRequest["params"]): Record<string, string> {
    const normalized: Record<string, string> = {};
    const entries = Object.entries(parameters ?? {});

    for (const [key, value] of entries) {
      normalized[key] = String(value);
    }

    return normalized;
  }
}
