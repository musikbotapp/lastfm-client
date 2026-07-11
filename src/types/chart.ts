import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./api-shared";
import type { ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

export interface ChartGetTopTracksOptions {
  limit?: number;
  page?: number;
}

export type ChartGetTopArtistsOptions = ChartGetTopTracksOptions;

// ======================================================================
// RESPONSES
// ======================================================================

interface ChartTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: ChartTopTrack[];
}

interface ChartTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  errorCode: ResponseError | "NO_TOP_TRACKS";
}

export type ChartTopTracksResponse = ChartTopTracksSuccessResponse | ChartTopTracksFailureResponse;

interface ChartTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: ChartTopArtist[];
}

interface ChartTopArtistsFailureResponse extends BaseFailureResponse {
  topArtists?: never;
  errorCode: ResponseError | "NO_TOP_ARTISTS";
}

export type ChartTopArtistsResponse = ChartTopArtistsSuccessResponse | ChartTopArtistsFailureResponse;

// ======================================================================
// RESPONSE SHAPES
// ======================================================================

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

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

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
