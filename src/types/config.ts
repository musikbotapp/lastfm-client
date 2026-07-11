export interface LastFmConfigApi {
  /**
   * Omit/leave blank if using env variable: LASTFM_API_KEY
   */
  key?: string;
  /**
   * Omit/leave blank if using env variable: LASTFM_API_SECRET
   */
  secret?: string;
  /**
   * The unique identifier for your application.
   * Omit or leave blank if using the `LASTFM_API_USER_AGENT` environment variable.
   * @example "MyApp/1.0.0 (https://contact@example.com/)"
   */
  userAgent?: string;
}

export interface LastFmConfigRateLimit {
  /**
   * Maximum number of concurrent token requests allowed in the bucket execution loop.
   * @default 2
   */
  bucketMax?: number;
  /**
   * Time interval in milliseconds for refilling token execution slots.
   * @default 250
   */
  refillIntervalMs?: number;
  /**
   * Max rate limiter queue length before request are rejected.
   * @default 1000
   */
  maxQueueSize?: number;
  /**
   * Base delay in milliseconds before retrying a rate-limited request.
   * @default 5000
   */
  backOffBaseMs?: number;
  /**
   * Base delay in milliseconds before retrying during a service outage.
   * @default 10000
   */
  backOffOutageBaseMs?: number;
}

export interface LastFmConfigNetwork {
  /**
   * Total retry attempts allowed per request for enabled error types.
   * @default 2
   */
  retries?: number;
  /**
   * Request processing cutoff limit in milliseconds passed to AbortSignal.timeout().
   * @default 4000
   */
  abortTimeoutMs?: number;
  /**
   * Specific failure types that trigger a retry attempt up to the max `retries` limit.
   */
  retryStrategy?: {
    /**
     * @default false
     */
    onRateLimit?: boolean;
    /**
     * @default false
     */
    onServiceOutage?: boolean;
    /**
     * Automatically retry when the request drops due to `abortTimeoutMs`.
     * @default true
     */
    onTimeout?: boolean;
  };
}

export interface LastFmConfigBehavior {
  /**
   * Last.fm will try to autocorrect misspelled artist and track names.
   * @default false
   */
  autoCorrectByDefault?: boolean;
  /**
   * Emits `request` event with type `error` on rejected requests by the ratelimiter.
   * @default false
   */
  emitRequestFailedOnReject?: boolean;
}

export interface LastFmConfiguration {
  api?: LastFmConfigApi;
  rateLimit?: LastFmConfigRateLimit;
  network?: LastFmConfigNetwork;
  behavior?: LastFmConfigBehavior;
}

export interface ResolvedLastFmConfiguration {
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
