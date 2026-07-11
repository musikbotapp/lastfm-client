import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./api-shared";
import type { ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

export interface AlbumSearchOptions {
  album: string;
  limit?: number;
  page?: number;
}

// ======================================================================
// RESPONSES
// ======================================================================

interface AlbumSearchSuccessResponse extends BaseSuccessResponse {
  albums: SearchResultAlbum[];
  totalResultsOnLastFm: number | null;
}

interface AlbumSearchFailureResponse extends BaseFailureResponse {
  albums?: never;
  totalResultsOnLastFm?: never;
  errorCode: ResponseError | "NO_ALBUM_MATCHES";
}

export type AlbumSearchResponse = AlbumSearchSuccessResponse | AlbumSearchFailureResponse;

// ======================================================================
// RESPONSE SHAPES
// ======================================================================

export interface SearchResultAlbum {
  streamable: boolean;
  name: string | null;
  artist: string | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

export interface LastFmSearchAlbum {
  name?: string;
  artist?: string;
  url?: string;
  image?: Image[];
  streamable?: string;
  mbid?: string;
}

export interface LastFmSearchAlbums {
  "opensearch:Query"?: {
    "#text"?: string;
    role?: string;
    searchTerms?: string;
    startPage?: string;
  };
  "opensearch:totalResults"?: string;
  "opensearch:startIndex"?: string;
  "opensearch:itemsPerPage"?: string;
  albummatches?: {
    album?: LastFmSearchAlbum[] | LastFmSearchAlbum;
  };
  "@attr"?: { for?: string };
}
