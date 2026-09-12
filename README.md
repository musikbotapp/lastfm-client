# @musikbotapp/lastfm-client

[![npm version](https://img.shields.io/npm/v/@musikbotapp/lastfm-client?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@musikbotapp/lastfm-client)
[![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Zero-dependency TypeScript client for the Last.fm API with normalized responses and rate limiting.

📖 **[API Reference](https://docs.musikbot.app/lastfm-client)**

## Key Features

- **Zero-Dependency Core:** Fully typed TypeScript client for the Last.fm API with no external runtime dependencies.

- **Normalized Responses:** Every method returns parsed, consistently shaped, fully typed responses instead of raw API payloads.

- **Built-In Rate Limiting:** Configurable token-bucket limiter with queueing and backoff for both rate-limit and service-outage scenarios.

- **Resilient Networking:** Automatic retries with configurable strategies for timeouts, rate limits, and outages, backed by request abort timeouts.

- **Batch Scrobbling:** Scrobble single tracks or submit batches in one call, with per-batch success counts on partial failure.

- **Event-Driven Monitoring:** Emits events for failed requests and expired sessions so you can hook in your own logging or alerting.

## Requirements

- **Node.js**: `≥ 18.0.0`
- **Last.fm API Key & Secret**

## Installation

```bash
npm install @musikbotapp/lastfm-client
```

## Quickstart

### Initialization (Environment Variables)

If `LASTFM_API_KEY`, `LASTFM_API_SECRET`, and `LASTFM_API_USER_AGENT` are set in your environment, initialization is zero-config:

```typescript
import { LastFmClient } from "@musikbotapp/lastfm-client";

const fm = new LastFmClient();
```

### Initialization (Custom Settings)

Alternatively, pass explicit configuration options:

```typescript
import { LastFmClient } from "@musikbotapp/lastfm-client";

const fm = new LastFmClient({
  api: {
    key: "YOUR_KEY",
    secret: "YOUR_SECRET",
    userAgent: "YourApp/1.0.0 (contact@example.com)",
  },
  rateLimit: {
    bucketMax: 3,
    refillIntervalMs: 300,
    maxQueueSize: 200,
    backOffBaseMs: 5000,
    backOffOutageBaseMs: 10_000,
  },
  network: {
    retries: 1,
    abortTimeoutMs: 4000,
    retryStrategy: {
      onRateLimit: true,
      onServiceOutage: true,
      onTimeout: true,
    },
  },
  behavior: {
    autoCorrectByDefault: true,
    emitRequestFailedOnReject: true,
  },
});
```

## Usage Examples

### Fetching User Info

```typescript
const res = await fm.user.getLovedTracks({ user: "username" });

if (!res.success) return console.warn(`(${res.errorCode}) ${res.errorMsg}`);

console.info(res.lovedTracks);
```

```typescript
const res = await fm.user.getNowPlaying({ user: "username" });

if (!res.success) return console.warn(`User is currently offline.`);

console.info(`Listening to: ${res.track.name} by ${res.track.artist.name}`);
```

### Scrobbling

Scrobble a single track, or submit several at once with `scrobbleBatch`.

```typescript
const res = await fm.track.scrobble({
  sk: "SESSION_KEY",
  track: "Aja",
  artist: "Steely Dan",
  timestamp: Math.floor(Date.now() / 1000),
  meta: { userId }, // optional
});

if (!res.success) return console.warn(`(${res.errorCode}) ${res.errorMsg}`);
```

```typescript
const now = Math.floor(Date.now() / 1000);
const tracks = [
  { track: "Aja", artist: "Steely Dan", timestamp: now },
  { track: "Keith Don't Go", artist: "Nils Lofgren", timestamp: now - 120 },
];

const res = await fm.track.scrobbleBatch({
  sk: "SESSION_KEY",
  tracks,
  meta: { userId }, // optional
});

if (!res.success) {
  return console.warn(`(scrobbled: ${res.scrobbledCount}) (${res.errorCode}) ${res.errorMsg}`);
}
```

### Event Handling

Listen to internal client events to monitor network behavior or handle session states.

```typescript
// Failed requests
fm.on("requestFailed", (payload) => {
  const { apiMethod, attempt, message, queueSize, willRetry } = payload;
  console.warn(`[${apiMethod}]: (Attempt: ${attempt}, Retry: ${willRetry}) (queueSize: ${queueSize}) ${message}`);
});

// Expired sessions
fm.on("sessionExpire", (message, meta) => {
  console.info(`[sessionExpire]: ${message}`, meta);
});
```
