import type { ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export type TokenResponse =
  | { success: true; errorCode?: never; errorMsg?: never; token: string }
  | { success: false; errorCode: ResponseError; errorMsg: string; token?: never };

export type SessionResponse =
  | { success: true; errorCode?: never; errorMsg?: never; session: LastFmSession }
  | { success: false; errorCode: ResponseError; errorMsg: string; session?: never };

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmSession {
  name: string;
  key: string;
  subscriber: number;
}
