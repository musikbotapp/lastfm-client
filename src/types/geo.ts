import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface GeoGetTopTracksOptions {
  /**
   * A country name, as defined by the ISO 3166-1 country names standard.
   */
  country: string;
  /**
   * A metro name, to fetch the charts for (must be within the country specified)
   */
  location?: string;
  /**
   * The number of results to fetch per page. (max 200)
   *
   * @defaultValue `50`
   */
  limit?: number;
  /**
   * The page number to fetch.
   *
   * @defaultValue `fist page`
   */
  page?: number;
}

/**
 * {@link GeoGetTopTracksOptions}
 */
export type GeoGetTopArtistsOptions = Omit<GeoGetTopTracksOptions, "location">;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface GeoTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: GeoTopTrack[];
}

interface GeoTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  errorCode: ResponseError;
}

export type GeoTopTracksResponse = GeoTopTracksSuccessResponse | GeoTopTracksFailureResponse;

interface GeoTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: GeoTopArtist[];
}

interface GeoTopArtistsFailureResponse extends BaseFailureResponse {
  topArtists?: never;
  errorCode: ResponseError;
}

export type GeoTopArtistsResponse = GeoTopArtistsSuccessResponse | GeoTopArtistsFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface GeoTopTrack {
  streamable: boolean;
  name: string | null;
  duration: number | null;
  listeners: number | null;
  mbid: string | null;
  url: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  images: ResolvedImages;
  rank: number | null;
}

export interface GeoTopArtist {
  streamable: boolean;
  name: string | null;
  listeners: number | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
  rank: number | null;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmGeoTopTrack {
  name?: string;
  duration?: string;
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
  "@attr"?: { rank?: string };
}

export interface LastFmGeoTopTracks {
  track?: LastFmGeoTopTrack[] | LastFmGeoTopTrack;
  "@attr"?: {
    country?: string;
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}

export interface LastFmGeoTopArtist {
  name?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: Image[];
  "@attr"?: { rank?: string };
}

export interface LastFmGeoTopArtists {
  artist?: LastFmGeoTopArtist[] | LastFmGeoTopArtist;
  "@attr"?: {
    country?: string;
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}
