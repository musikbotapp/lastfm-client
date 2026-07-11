export type APIRequestMethod = "POST" | "GET";

export type LastFmMethod =
  // --- Auth
  | "auth.gettoken"
  | "auth.getsession"

  // --- User
  | "user.getinfo"
  | "user.getlovedtracks"
  | "user.getrecenttracks"
  | "user.gettoptracks"
  | "user.gettopartists"
  | "user.gettopalbums"

  // --- Track
  | "track.scrobble"
  | "track.updatenowplaying"
  | "track.getsimilar"
  | "track.love"
  | "track.unlove"
  | "track.search"

  // --- Artist
  | "artist.getsimilar"
  | "artist.gettoptracks"
  | "artist.gettopalbums"
  | "artist.search"

  // --- Album
  | "album.search"

  // --- Chart
  | "chart.gettoptracks"
  | "chart.gettopartists";

export type CustomMetadata<T extends Record<string, unknown> = Record<string, unknown>> = T;

export type ResponseError = string | number | "MISSING_REQUIREMENTS";

export interface APIRequestOptions {
  apiMethod: LastFmMethod;
  signature: boolean;
  params?: Record<string, string | number | boolean>;
}

export interface SendRequestOptions {
  method: APIRequestMethod;
  request: APIRequestOptions;
  meta?: CustomMetadata;
  retries?: number;
}

export interface HandleResponseEventOptions {
  status: number;
  endpoint: LastFmMethod;
  startTime: bigint;
  retries: number;
  meta?: CustomMetadata;
  response: unknown;
}

export interface LastFmEvents {
  /**
   * Emitted on last fm error code (9) when session key is invalid or expired.
   */
  sessionExpire: (message: string, meta: CustomMetadata) => void;
  /**
   * Emitted on missing requirements.
   */
  warn: (info: { apiMethod: LastFmMethod | null; message: string }) => void;
  /**
   * Emitted on failed requests.
   */
  requestFailed: (payload: {
    apiMethod: LastFmMethod;
    type: "error" | "ratelimit";
    message: string;
    attempt: number;
    willRetry: boolean;
    queueSize: number;
  }) => void;
}

export type LastFmApiResponse<T> =
  | { success: true; data: T; errorCode?: never; errorMsg?: never }
  | { success: false; errorCode: string | number; errorMsg: string };
