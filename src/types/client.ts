/* eslint-disable tsdoc/syntax */
import type { APIMethod } from "./rest";
import type { CustomMetadata } from "./shared";

export interface ClientConfigApi {
  /**
   * Omit/leave blank if using env variable: LASTFM_API_KEY
   */
  key?: string;
  /**
   * Omit/leave blank if using env variable: LASTFM_API_SECRET
   */
  secret?: string;
  /**
   * The unique identifier for your app.
   * Omit or leave blank if using the `LASTFM_API_USER_AGENT` environment variable.
   *
   * @example "MyApp/1.0.0 (https://contact@example.com/)"
   */
  userAgent?: string;
}

export interface ClientConfigRateLimit {
  /**
   * Maximum number of concurrent token requests allowed in the bucket execution loop.
   * @defaultValue `3`
   */
  bucketMax?: number;
  /**
   * Time interval in milliseconds for refilling token execution slots.
   * @defaultValue `250`
   */
  refillIntervalMs?: number;
  /**
   * Max rate limiter queue length before request are rejected.
   * @defaultValue `1000`
   */
  maxQueueSize?: number;
  /**
   * Base delay in milliseconds before retrying a rate-limited request.
   * @defaultValue `5000`
   */
  backOffBaseMs?: number;
  /**
   * Base delay in milliseconds before retrying during a service outage.
   * @defaultValue `10000`
   */
  backOffOutageBaseMs?: number;
}

export interface ClientConfigNetwork {
  /**
   * Total retry attempts allowed per request for enabled error types.
   * @defaultValue `2`
   */
  retries?: number;
  /**
   * Request processing cutoff limit in milliseconds passed to AbortSignal.timeout().
   * @defaultValue `4000`
   */
  abortTimeoutMs?: number;
  /**
   * Specific failure types that trigger a retry attempt up to the max `retries` limit.
   */
  retryStrategy?: {
    /**
     * @defaultValue `false`
     */
    onRateLimit?: boolean;
    /**
     * @defaultValue `false`
     */
    onServiceOutage?: boolean;
    /**
     * Automatically retry when the request drops due to `abortTimeoutMs`.
     * @defaultValue `true`
     */
    onTimeout?: boolean;
  };
}

export interface ClientConfigBehavior {
  /**
   * Last.fm will try to autocorrect misspelled artist and track names.
   * @defaultValue `false`
   */
  autoCorrectByDefault?: boolean;
  /**
   * Emits `request` event with type `error` on rejected requests by the ratelimiter.
   * @defaultValue `false`
   */
  emitRequestFailedOnReject?: boolean;
}

export interface ClientConfig {
  api?: ClientConfigApi;
  rateLimit?: ClientConfigRateLimit;
  network?: ClientConfigNetwork;
  behavior?: ClientConfigBehavior;
}

export interface ResolvedClientConfig {
  api: {
    key: string;
    secret: string;
    userAgent: string;
  };
  rateLimit: {
    bucketMax: number;
    refillIntervalMs: number;
    maxQueueSize: number;
    backOffBaseMs: number;
    backOffOutageBaseMs: number;
  };
  network: {
    retries: number;
    abortTimeoutMs: number;
    retryStrategy: {
      onRateLimit: boolean;
      onServiceOutage: boolean;
      onTimeout: boolean;
    };
  };
  behavior: {
    autoCorrectByDefault: boolean;
    emitRequestFailedOnReject: boolean;
  };
}

export enum Events {
  SESSION_EXPIRE = "sessionExpire",
  WARN = "warn",
  REQUEST_FAILED = "requestFailed",
}

export interface RequestFailedPayload {
  apiMethod: APIMethod;
  type: "error" | "ratelimit";
  message: string;
  attempt: number;
  willRetry: boolean;
  queueSize: number;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LastFmClientEvents = {
  /**
   * Emitted on last fm error code (9) when session key is invalid or expired.
   */
  sessionExpire: [message: string, meta: CustomMetadata];
  /**
   * Emitted on failed requests.
   */
  requestFailed: [payload: RequestFailedPayload];
};
