import { version } from "../../package.json";
import type { ClientConfig, ResolvedClientConfig } from "@local-types/client";

/**
 * Validates the configuration object.
 */
export function resolveClientConfig(config?: ClientConfig): ResolvedClientConfig {
  if (typeof config !== "object") {
    throw new TypeError("[config]: client config must be an object");
  }

  const resolvedConfig = {
    api: {
      key: config.api?.key ?? process.env.LASTFM_API_KEY ?? "",
      secret: config.api?.secret ?? process.env.LASTFM_API_SECRET ?? "",
      userAgent: config.api?.userAgent ?? process.env.LASTFM_API_USER_AGENT ?? `lastfm-client/${version}`,
    },
    rateLimit: {
      bucketMax: config.rateLimit?.bucketMax ?? 3,
      refillIntervalMs: config.rateLimit?.refillIntervalMs ?? 250,
      maxQueueSize: config.rateLimit?.maxQueueSize ?? 1000,
      backOffBaseMs: config.rateLimit?.backOffBaseMs ?? 5000,
      backOffOutageBaseMs: config.rateLimit?.backOffOutageBaseMs ?? 10_000,
    },
    network: {
      retries: config.network?.retries ?? 2,
      abortTimeoutMs: config.network?.abortTimeoutMs ?? 4000,
      retryStrategy: {
        onRateLimit: config.network?.retryStrategy?.onRateLimit ?? false,
        onServiceOutage: config.network?.retryStrategy?.onServiceOutage ?? false,
        onTimeout: config.network?.retryStrategy?.onTimeout ?? true,
      },
    },
    behavior: {
      autoCorrectByDefault: config.behavior?.autoCorrectByDefault ?? false,
      emitRequestFailedOnReject: config.behavior?.emitRequestFailedOnReject ?? false,
    },
  };

  const { api, rateLimit, network, behavior } = resolvedConfig;

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

  return resolvedConfig;
}
