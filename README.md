# lastfm-client

Zero-dependency TypeScript client for the Last.fm API with normalized responses and rate limiting.

## Quick Start

### 1. Installation

```bash
npm install @musikbotapp/lastfm-client
```

### 2. Initialization

#### Using Environment Variables

If `LASTFM_API_KEY`, `LASTFM_API_SECRET`, and `LASTFM_API_USER_AGENT` are set in your environment, initialization is zero-config:

```typescript
import { LastFm } from "@musikbotapp/lastfm-client";

const fm = new LastFm();
```

#### Using Custom Settings

Alternatively, you can pass explicit configuration options:

```typescript
import { LastFm } from "@musikbotapp/lastfm-client";

const fm = new LastFm({
  api: {
    key: "YOUR_KEY",
    secret: "YOUR_SECRET",
    userAgent: "YourApp/1.0.0 (contact@example.com)",
  },
  rateLimit: {
    bucketMax: 3,
    refillIntervalMs: 300,
    maxQueueSize: 200,
    backOffBaseMs: 5_000,
    backOffOutageBaseMs: 10_000,
  },
  network: {
    retries: 1,
    abortTimeoutMs: 4_000,
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

---

## Usage Examples

All methods return fully typed, parsed, and normalized responses.

### Fetching User Info

- **Get Loved Tracks**

```typescript
const res = await fm.user.getLovedTracks({ user: "username" });

if (!res.success) return console.warn(`(${res.errorCode}) ${res.errorMsg}`);

console.info(res.lovedTracks);
```

- **Get Now Playing Track**

```typescript
const res = await fm.user.getNowPlaying({ user: "username" });

if (!res.success) return console.warn(`User is currently offline.`);

console.info(`Listening to: ${res.track.name} by ${res.track.artist.name}`);
```

### Scrobbling

- **Single Track**

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

- **Batch Scrobbling**

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

---

## Event Handling

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

// Warnings
fm.on("warn", (info) => {
  console.warn(`[${info.apiMethod}]: ${info.message}`);
});
```
