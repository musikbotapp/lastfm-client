import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, CustomMetadata } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface BaseOptions {
  /**
   * The track name.
   */
  track: string;
  /**
   * The artist name.
   */
  artist: string;
}

/**
 * {@link BaseOptions}
 */
export interface ExtendedBaseOptions extends BaseOptions {
  /**
   * The Last.fm session key.
   */
  sk: string;
  /**
   * The length of the track in seconds.
   */
  duration?: number;
  /**
   * Custom metadata for `sessionExpire` event.
   */
  meta?: CustomMetadata;
}

/**
 * {@link ExtendedBaseOptions}
 */
export interface ScrobbleOptions extends ExtendedBaseOptions {
  /**
   * The time the track started playing, in Unix timestamp format (integer number of seconds since 00:00:00, January 1st 1970 UTC).
   * This must be in the UTC time zone.
   */
  timestamp: number;
  /**
   * `true` if the user chose this song, or `false` if the song was chosen by someone else (such as a radio station or recommendation service).
   */
  chosenByUser?: boolean;
}

export interface ScrobbleBatchOptions {
  /**
   * The Last.fm session key.
   */
  sk: string;
  /**
   * The array of tracks to scrobble. [\{ track, artist, timestamp, duration (optional), chosenByUser (optional) \}, ...]
   */
  tracks: Omit<ScrobbleOptions, "sk" | "meta">[];
  /**
   * Custom metadata for `sessionExpire` event.
   */
  meta?: CustomMetadata;
}

/**
 * {@link ExtendedBaseOptions}
 */
export type UpdateNowPlayingOptions = ExtendedBaseOptions;

/**
 * {@link BaseOptions}
 */
export interface TrackGetSimilarOptions extends BaseOptions {
  /**
   * Maximum number of similar tracks to return. (max 200)
   *
   * @defaultValue `50`
   */
  limit?: number;
  /**
   * Transform misspelled artist names into correct artist names, returning the correct version instead.
   * The corrected artist name will be returned in the response.
   */
  autoCorrect?: boolean;
}

/**
 * {@link ExtendedBaseOptions}
 */
export type TrackLoveOptions = Omit<ExtendedBaseOptions, "duration">;

/**
 * {@link ExtendedBaseOptions}
 */
export type TrackUnLoveOptions = Omit<ExtendedBaseOptions, "duration">;

export interface TrackSearchOptions {
  /**
   * The track name.
   */
  track: string;
  /**
   * Narrow your search by specifying an artist.
   */
  artist?: string;
  /**
   * The number of results to fetch per page. (max 200)
   *
   * @defaultValue `30`
   */
  limit?: number;
  /**
   * The page number to fetch.
   *
   * @defaultValue `first page`
   */
  page?: number;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export type ScrobbleResponse = BaseSuccessResponse | BaseFailureResponse;
export type ScrobbleBatchResponse =
  | (BaseSuccessResponse & { scrobbledCount: number })
  | (BaseFailureResponse & { scrobbledCount: number });

export type UpdateNowPlayingResponse = BaseSuccessResponse | BaseFailureResponse;

export interface SimilarTrackSuccessResponse extends BaseSuccessResponse {
  similarTracks: SimilarTrack[];
  trackName: string;
  artistName: string;
}

export interface SimilarTrackFailureResponse extends BaseFailureResponse {
  similarTracks?: never;
  trackName?: never;
  artistName?: never;
}

export type SimilarTrackResponse = SimilarTrackSuccessResponse | SimilarTrackFailureResponse;

export type LoveResponse = BaseSuccessResponse | BaseFailureResponse;
export type UnLoveResponse = BaseSuccessResponse | BaseFailureResponse;

export interface TrackSearchSuccessResponse extends BaseSuccessResponse {
  tracks: SearchResultTrack[];
  totalResultsOnLastFm: number | null;
}

export interface TrackSearchFailureResponse extends BaseFailureResponse {
  tracks?: never;
  totalResultsOnLastFm?: never;
}

export type TrackSearchResponse = TrackSearchSuccessResponse | TrackSearchFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface SimilarTrack {
  streamable: boolean | null;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  url: string | null;
  mbid: string | null;
  duration: number | null;
  match: number | null;
  playcount: number | null;
  images: ResolvedImages;
}

export interface SearchResultTrack {
  streamable: boolean;
  name: string | null;
  artist: string | null;
  url: string | null;
  mbid: string | null;
  listeners: number | null;
  images: ResolvedImages;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmSimilarTrack {
  name?: string;
  playcount?: string | number;
  mbid?: string;
  match?: string | number;
  url?: string;
  streamable?: {
    "#text"?: string;
    fulltrack?: string;
  };
  duration?: string | number;
  artist?: {
    name?: string;
    mbid?: string;
    url?: string;
  };
  image: Image[];
}

export interface LastFmSimilarTracks {
  track?: LastFmSimilarTrack[] | LastFmSimilarTrack;
  "@attr"?: { artist?: string; track?: string };
}

export interface LastFmSearchTrack {
  name?: string;
  artist?: string;
  url?: string;
  streamable?: string;
  listeners?: string;
  image?: Image[];
  mbid?: string;
}

export interface LastFmSearchTracks {
  "opensearch:Query"?: {
    "#text"?: string;
    role?: string;
    searchTerms?: string;
    startPage?: string;
  };
  "opensearch:totalResults"?: string;
  "opensearch:startIndex"?: string;
  "opensearch:itemsPerPage"?: string;
  trackmatches?: {
    track?: LastFmSearchTrack[] | LastFmSearchTrack;
  };
  "@attr"?: { for?: string };
}
