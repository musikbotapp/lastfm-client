import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface ChartGetTopTracksOptions {
  /**
   * The number of results to fetch per page. (max 200)
   *
   * @defaultValue `50`
   */
  limit?: number;
  /**
   * The page number to fetch.
   *
   * @defaultValue `first page`
   */
  page?: number;
}

/**
 * {@link ChartGetTopTracksOptions}
 */
export type ChartGetTopArtistsOptions = ChartGetTopTracksOptions;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface ChartTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: ChartTopTrack[];
}

interface ChartTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  errorCode: ResponseError;
}

export type ChartTopTracksResponse = ChartTopTracksSuccessResponse | ChartTopTracksFailureResponse;

interface ChartTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: ChartTopArtist[];
}

interface ChartTopArtistsFailureResponse extends BaseFailureResponse {
  topArtists?: never;
  errorCode: ResponseError;
}

export type ChartTopArtistsResponse = ChartTopArtistsSuccessResponse | ChartTopArtistsFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface ChartTopTrack {
  streamable: boolean;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  duration: number | null;
  playcount: number | null;
  listeners: number | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

export interface ChartTopArtist {
  streamable: boolean;
  name: string | null;
  playcount: number | null;
  listeners: number | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmChartTopTrack {
  name?: string;
  duration?: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: {
    "#text"?: string;
    fulltrack?: string;
  };
  artist?: {
    name?: string;
    mbid?: string;
    url?: string;
  };
  image?: Image[];
}

export interface LastFmChartTopTracks {
  track?: LastFmChartTopTrack[] | LastFmChartTopTrack;
  "@attr"?: {
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}

export interface LastFmChartTopArtist {
  name?: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: Image[];
}

export interface LastFmChartTopArtists {
  artist?: LastFmChartTopArtist[] | LastFmChartTopArtist;
  "@attr"?: {
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}
