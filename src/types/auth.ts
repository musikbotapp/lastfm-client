// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import type { BaseFailureResponse, BaseSuccessResponse } from "./shared";

export interface TokenSuccessResponse extends BaseSuccessResponse {
  token: string;
}

export interface TokenFailureResponse extends BaseFailureResponse {
  token?: never;
}

export type TokenResponse = TokenSuccessResponse | TokenFailureResponse;

export interface SessionSuccessResponse extends BaseSuccessResponse {
  session: LastFmSession;
}

export interface SessionFailureResponse extends BaseFailureResponse {
  session?: never;
}

export type SessionResponse = SessionSuccessResponse | SessionFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmSession {
  name: string;
  key: string;
  subscriber: number;
}
