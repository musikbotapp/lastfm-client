import type { ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

export interface GetUrlOptions {
  token: string;
}

export interface GetCallbackUrlOptions {
  url: string;
}

export interface GetSessionOptions {
  token: string;
}

// ======================================================================
// RESPONSES
// ======================================================================

export type TokenResponse =
  | { success: true; errorCode?: never; errorMsg?: never; token: string }
  | { success: false; errorCode: ResponseError | "NO_TOKEN"; errorMsg: string; token?: never };

export type SessionResponse =
  | { success: true; errorCode?: never; errorMsg?: never; session: LastFmSession }
  | { success: false; errorCode: ResponseError; errorMsg: string; session?: never };

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

export interface LastFmSession {
  name: string;
  key: string;
  subscriber: number;
}
