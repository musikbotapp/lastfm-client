import type { CustomMetadata } from "./shared";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
}

export type LastFmAPIMethod =
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
  | "chart.gettopartists"

  // --- Geo
  | "geo.gettoptracks"
  | "geo.gettopartists";

export type APIMethod = LastFmAPIMethod | (string & {});

export interface RequestData {
  /**
   * Query string parameters to append to the called endpoint
   */
  params?: Record<string, string | number | boolean>;
  /**
   * Additional headers to add to this request
   */
  headers?: Record<string, string>;
  /**
   * Should this called be signed with the signature.
   */
  signature?: boolean;
  /**
   * Custom metadata to assign.
   */
  meta?: CustomMetadata;
}

export interface InternalRequest extends RequestData {
  apiMethod: APIMethod;
  method: RequestMethod;
  retries: number;
}

export interface FetchOptions {
  fetchOptions: RequestInit;
  url: string;
}

export interface APIErrorPayload {
  error?: unknown;
  message?: unknown;
  syntaxError?: true;
}

export interface APISuccessResponse<T> {
  success: true;
  data: T;
  errorCode?: never;
  errorMsg?: never;
}

export interface APIFailureResponse {
  success: false;
  errorCode: string | number;
  errorMsg: string;
  data?: never;
}

export type APIResponse<T> = APISuccessResponse<T> | APIFailureResponse;
