import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface AlbumSearchOptions {
  /**
   * The album name.
   */
  album: string;
  /**
   * The number of results to fetch per page. (max 200)
   *
   * @defaultValue `30`
   */
  limit?: number;
  /**
   * The page number to fetch. Defaults to first page.
   */
  page?: number;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface AlbumSearchSuccessResponse extends BaseSuccessResponse {
  albums: SearchResultAlbum[];
  totalResultsOnLastFm: number | null;
}

interface AlbumSearchFailureResponse extends BaseFailureResponse {
  albums?: never;
  totalResultsOnLastFm?: never;
  errorCode: ResponseError;
}

export type AlbumSearchResponse = AlbumSearchSuccessResponse | AlbumSearchFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface SearchResultAlbum {
  streamable: boolean;
  name: string | null;
  artist: string | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
