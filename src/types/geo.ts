import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./api-shared";
import type { ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

export interface GeoGetTopTracksOptions {
  country: string;
  location?: string;
  limit?: number;
  page?: number;
}

export interface GeoGetTopArtistsOptions {
  country: string;
  limit?: number;
  page?: number;
}

// ======================================================================
// RESPONSES
// ======================================================================

interface GeoTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: GeoTopTrack[];
}

interface GeoTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  errorCode: ResponseError | "GEO_NO_TOP_TRACKS";
}

export type GeoTopTracksResponse = GeoTopTracksSuccessResponse | GeoTopTracksFailureResponse;

interface GeoTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: GeoTopArtist[];
}

interface GeoTopArtistsFailureResponse extends BaseFailureResponse {
  topArtists?: never;
  errorCode: ResponseError | "GEO_NO_TOP_ARTISTS";
}

export type GeoTopArtistsResponse = GeoTopArtistsSuccessResponse | GeoTopArtistsFailureResponse;

// ======================================================================
// RESPONSE SHAPES
// ======================================================================

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

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

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
