import { EventEmitter } from "node:events";
import { version } from "../../package.json";
import { generateApiSignature, TokenBucket, isDOMException, isErrnoException } from "../utils";
import type { LastFmConfiguration, ResolvedLastFmConfiguration } from "../types/config";
import type {
  APIRequestMethod,
  APIRequestOptions,
  LastFmApiResponse,
  LastFmEvents,
  SendRequestOptions,
} from "../types/context";

export class LastFmContext extends EventEmitter {
  public readonly config: ResolvedLastFmConfiguration;
  private readonly baseUrl: string;
  private readonly bucket: TokenBucket;

  constructor(config?: LastFmConfiguration) {
    super();

    this.config = {
      api: {
        key: config?.api?.key ?? process.env.LASTFM_API_KEY ?? "",
        secret: config?.api?.secret ?? process.env.LASTFM_API_SECRET ?? "",
        userAgent: `${config?.api?.userAgent ?? process.env.LASTFM_API_USER_AGENT ?? `lastfm-client/${version}`}`,
      },
      rateLimit: {
        bucketMax: config?.rateLimit?.bucketMax ?? 3,
        refillIntervalMs: config?.rateLimit?.refillIntervalMs ?? 250,
        maxQueueSize: config?.rateLimit?.maxQueueSize ?? 1_000,
        backOffBaseMs: config?.rateLimit?.backOffBaseMs ?? 5_000,
        backOffOutageBaseMs: config?.rateLimit?.backOffOutageBaseMs ?? 10_000,
      },
      network: {
        retries: config?.network?.retries ?? 2,
        abortTimeoutMs: config?.network?.abortTimeoutMs ?? 4_000,
        retryStrategy: {
          onRateLimit: config?.network?.retryStrategy?.onRateLimit ?? false,
          onServiceOutage: config?.network?.retryStrategy?.onServiceOutage ?? false,
          onTimeout: config?.network?.retryStrategy?.onTimeout ?? true,
        },
      },
      behavior: {
        autoCorrectByDefault: config?.behavior?.autoCorrectByDefault ?? false,
        emitRequestFailedOnReject: config?.behavior?.emitRequestFailedOnReject ?? false,
      },
    };

    this.validateConfig();

    this.baseUrl = `https://ws.audioscrobbler.com/2.0/`;

    this.bucket = new TokenBucket({
      bucketMax: this.config.rateLimit.bucketMax,
      refillIntervalMs: this.config.rateLimit.refillIntervalMs,
      maxQueueSize: this.config.rateLimit.maxQueueSize,
    });
  }

  public override on<K extends keyof LastFmEvents>(event: K, listener: LastFmEvents[K]): this {
    return super.on(event, listener);
  }

  public override once<K extends keyof LastFmEvents>(event: K, listener: LastFmEvents[K]): this {
    return super.once(event, listener);
  }

  public override emit<K extends keyof LastFmEvents>(event: K, ...args: Parameters<LastFmEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  public clearRequestQueue() {
    return this.bucket.clearQueue();
  }

  /**
   * Core request pipeline that waits on the bucket and fetches data.
   */
  public async sendRequest<T>(options: SendRequestOptions): Promise<LastFmApiResponse<T>> {
    const { method, request, retries = this.config.network.retries } = options;

    try {
      await this.bucket.wait();

      const { fetchOptions, urlParams } = this.buildFetchOptions(method, request);
      const methodUrl = method === "POST" ? this.baseUrl : `${this.baseUrl}?${urlParams}`;

      const result = await fetch(methodUrl, fetchOptions);
      const response = await this.parseJsonSafely(result);

      return await this.handleApiResponse<T>({ options, result, response, retries });
    } catch (err) {
      return await this.handleNetworkError<T>({ err, options, retries });
    }
  }

  /**
   * Catches JSON parsing errors safely to prevent unhandled crashing.
   */
  private async parseJsonSafely(result: Response): Promise<unknown> {
    return (await result.json().catch((err) => {
      if (err instanceof SyntaxError) return { syntaxError: true };
      throw err;
    })) as unknown;
  }

  /**
   * Handles Last.fm API response codes (Code 29, 11, 16, 9) and formats data.
   */
  private async handleApiResponse<T>(context: {
    result: Response;
    response: unknown;
    options: SendRequestOptions;
    retries: number;
  }): Promise<LastFmApiResponse<T>> {
    const { result, response, options, retries } = context;
    const { status, statusText } = result;
    const { method, request, meta = {} } = options;
    const { apiMethod } = request;

    //prettier-ignore
    const payload = { apiMethod, type: "error" as const, attempt: this.getAttempt(retries), queueSize: this.bucket.queueSize };

    if (!response || typeof response !== "object") {
      this.emit("requestFailed", { ...payload, message: `Malformed Response: ${typeof response}`, willRetry: false });
      return { success: false, errorCode: "BAD_RESPONSE", errorMsg: "Received malformed response from Last.fm" };
    }

    if ("error" in response) {
      const error = typeof response.error === "number" ? response.error : 8;
      const message =
        "message" in response && typeof response.message === "string" ? response.message : "An unknown error occurred.";

      const isTransient = error === 29 || error === 11 || error === 16;

      if (isTransient && retries > 0) {
        const { backOffBaseMs, backOffOutageBaseMs } = this.config.rateLimit;
        const { onRateLimit, onServiceOutage } = this.config.network.retryStrategy;

        const backOffMs = error === 29 ? backOffBaseMs : backOffOutageBaseMs;
        const shouldRetry = error === 29 ? onRateLimit : onServiceOutage;

        const errorMsg = `(${error}) ${message}. ${shouldRetry ? `Retry in` : `Backing off`} ${backOffMs}ms`;
        const type = error === 29 ? "ratelimit" : "error";

        this.emit(`requestFailed`, { ...payload, type, message: errorMsg, willRetry: shouldRetry });
        this.bucket.applyBackoff(backOffMs);

        return shouldRetry
          ? await this.sendRequest({ method, request, retries: retries - 1, meta })
          : { success: false, errorCode: error, errorMsg };
      }

      if (error === 9) {
        this.emit("sessionExpire", `[${apiMethod}]: (9) Invalid session key - Please re-authenticate`, meta);
      }

      this.emit(`requestFailed`, { ...payload, message: `(${error}) ${message}`, willRetry: false });
      return { success: false, errorCode: error, errorMsg: message };
    }

    if (!result.ok || "syntaxError" in response) {
      this.emit(`requestFailed`, { ...payload, message: `Res not ok: (${status}) ${statusText}`, willRetry: false });
      return { success: false, errorCode: status, errorMsg: statusText };
    }

    return { success: true, data: response as T };
  }

  /**
   * Handles and categorizes errors and timeouts.
   */
  private async handleNetworkError<T>(context: {
    err: unknown;
    options: SendRequestOptions;
    retries: number;
  }): Promise<LastFmApiResponse<T>> {
    const { err, options, retries } = context;
    const { method, request, meta } = options;
    const { apiMethod } = request;

    const emitOnRejected = this.config.behavior.emitRequestFailedOnReject;
    const normalizedErrorMsg = err instanceof Error ? err.message : String(err);

    if (!emitOnRejected && normalizedErrorMsg.startsWith("[TokenBucket]")) {
      return { success: false, errorCode: "REJECTED", errorMsg: `${normalizedErrorMsg}` };
    }

    const errorCode = isErrnoException(err) ? (err.code ?? err.name) : isDOMException(err) ? err.name : "REJECTED";

    const isTimeout = errorCode === "TimeoutError" || errorCode === "ETIMEDOUT" || errorCode === "AbortError";
    const shouldRetry = isTimeout && this.config.network.retryStrategy.onTimeout;

    //prettier-ignore
    const payload = { apiMethod, type: "error" as const, attempt: this.getAttempt(retries), queueSize: this.bucket.queueSize };

    if (shouldRetry && retries > 0) {
      this.emit("requestFailed", { ...payload, message: `Network issue (${errorCode}). Retrying...`, willRetry: true });
      return await this.sendRequest({ method, request, retries: retries - 1, meta });
    }

    this.emit("requestFailed", { ...payload, message: normalizedErrorMsg, willRetry: false });
    return { success: false, errorCode, errorMsg: `${isTimeout ? "Network error" : "Error"} (${errorCode})` };
  }

  private getAttempt(retries: number): number {
    return this.config.network.retries - retries + 1;
  }

  /**
   * Builds headers, injects the custom User-Agent, and initializes the timeout signal.
   */
  private buildFetchOptions(method: APIRequestMethod, request: APIRequestOptions) {
    const { apiMethod, signature, params } = request;

    const urlParams = this.encodeUrlParams({ apiMethod, signature, params });

    const fetchOptions: RequestInit = {
      method,
      headers: { "User-Agent": this.config.api.userAgent },
      signal: AbortSignal.timeout(this.config.network.abortTimeoutMs),
    };

    if (method === "POST") {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      };
      fetchOptions.body = urlParams;
    }

    return { fetchOptions, urlParams };
  }

  /**
   * Formats parameters, appends global keys, and signs requests when required.
   */
  private encodeUrlParams({ apiMethod, signature, params = {} }: APIRequestOptions): string {
    const normalizedParams: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      normalizedParams[key] = String(value);
    }

    const signatureBaseParams = {
      ...normalizedParams,
      method: apiMethod,
      api_key: this.config.api.key,
    };

    const finalParams: Record<string, string> = {
      ...signatureBaseParams,
      format: "json",
    };

    if (signature) {
      finalParams.api_sig = generateApiSignature({ secret: this.config.api.secret, params: signatureBaseParams });
    }

    return new URLSearchParams(finalParams).toString();
  }

  /**
   * Validates the configuration object.
   */
  private validateConfig(): void {
    const { api, rateLimit, network, behavior } = this.config;

    for (const key of ["key", "secret"] as const) {
      if (typeof api[key] !== "string" || api[key].trim() === "") {
        throw new TypeError(`[config]: api.${key === "key" ? "key" : key} must be a non-empty string.`);
      }
    }
    if (typeof api.userAgent !== "string") {
      throw new TypeError("[config]: api.userAgent must be a string.");
    }

    const numbersToValidate = [
      { name: "rateLimit.bucketMax", val: rateLimit.bucketMax },
      { name: "rateLimit.refillIntervalMs", val: rateLimit.refillIntervalMs },
      { name: "rateLimit.maxQueueSize", val: rateLimit.maxQueueSize },
      { name: "rateLimit.backOffBaseMs", val: rateLimit.backOffBaseMs },
      { name: "rateLimit.backOffOutageBaseMs", val: rateLimit.backOffOutageBaseMs },
      { name: "network.retries", val: network.retries },
      { name: "network.abortTimeoutMs", val: network.abortTimeoutMs },
    ];

    for (const { name, val } of numbersToValidate) {
      if (typeof val !== "number" || Number.isNaN(val)) {
        throw new TypeError(`[config]: ${name} must be a valid number.`);
      }
    }

    const booleansToValidate = [
      { name: "network.retryStrategy.onRateLimit", val: network.retryStrategy.onRateLimit },
      { name: "network.retryStrategy.onServiceOutage", val: network.retryStrategy.onServiceOutage },
      { name: "network.retryStrategy.onTimeout", val: network.retryStrategy.onTimeout },
      { name: "behavior.autoCorrectByDefault", val: behavior.autoCorrectByDefault },
      { name: "behavior.emitRequestFailedOnReject", val: behavior.emitRequestFailedOnReject },
    ];

    for (const { name, val } of booleansToValidate) {
      if (typeof val !== "boolean") {
        throw new TypeError(`[config]: ${name} must be a boolean.`);
      }
    }
  }
}
