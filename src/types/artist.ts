import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface GetArtistBase {
  /**
   * The artist name.
   */
  artist: string;
  /**
   * Limit the number of similar artists returned. (max 200)
   *
   * @defaultValue `50`
   */
  limit?: number;
  /**
   * Transform misspelled artist names into correct artist names, returning the correct version instead.
   * The corrected artist name will be returned in the response.
   *
   * @defaultValue `config.behavior.autoCorrectByDefault`
   */
  autoCorrect?: boolean;
}

/**
 * {@link GetArtistBase}
 */
export type ArtistGetSimilarOptions = GetArtistBase;

/**
 * {@link GetArtistBase}
 */
export type ArtistGetTopTracksOptions = GetArtistBase;

/**
 * {@link GetArtistBase}
 */
export type ArtistGetTopAlbumsOptions = GetArtistBase;

export interface ArtistSearchOptions {
  /**
   * The artist name.
   */
  artist: string;
  /**
   * The number of results to fetch per page. (max 200)
   *
   * @defaultValue `30`
   */
  limit?: number;
  /**
   * The page number to fetch.
   */
  page?: number;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface SimilarArtistSuccessResponse extends BaseSuccessResponse {
  similarArtists: SimilarArtist[];
  artistName: string;
}

interface SimilarArtistFailureResponse extends BaseFailureResponse {
  similarArtists?: never;
  artistName?: never;
  errorCode: ResponseError;
}

export type SimilarArtistResponse = SimilarArtistSuccessResponse | SimilarArtistFailureResponse;

interface ArtistTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: ArtistTopTrack[];
  artistName: string;
}

interface ArtistTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  artistName?: never;
  errorCode: ResponseError;
}

export type ArtistTopTracksResponse = ArtistTopTracksSuccessResponse | ArtistTopTracksFailureResponse;

interface ArtistTopAlbumsSuccessResponse extends BaseSuccessResponse {
  topAlbums: ArtistTopAlbum[];
  artistName: string;
}

interface ArtistTopAlbumsFailureResponse extends BaseFailureResponse {
  topAlbums?: never;
  artistName?: never;
  errorCode: ResponseError;
}

export type ArtistTopAlbumsResponse = ArtistTopAlbumsSuccessResponse | ArtistTopAlbumsFailureResponse;

interface ArtistSearchSuccessResponse extends BaseSuccessResponse {
  artists: SearchResultArtist[];
  totalResultsOnLastFm: number | null;
}

interface ArtistSearchFailureResponse extends BaseFailureResponse {
  artists?: never;
  totalResultsOnLastFm?: never;
  errorCode: ResponseError;
}

export type ArtistSearchResponse = ArtistSearchSuccessResponse | ArtistSearchFailureResponse;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface SimilarArtist {
  streamable: boolean;
  name: string | null;
  mbid: string | null;
  match: number | null;
  url: string | null;
  images: ResolvedImages;
}

export interface ArtistTopTrack {
  streamable: boolean;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  playcount: number | null;
  listeners: number | null;
  mbid: string | null;
  images: ResolvedImages;
  rank: number | null;
}

export interface ArtistTopAlbum {
  name: string | null;
  playcount: number | null;
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

export interface SearchResultArtist {
  streamable: boolean;
  name: string | null;
  listeners: number | null;
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmSimilarArtist {
  name?: string;
  mbid?: string;
  match?: string | number;
  url?: string;
  image?: Image[];
  streamable?: string;
}

export interface LastFmSimilarArtists {
  artist?: LastFmSimilarArtist[] | LastFmSimilarArtist;
  "@attr"?: { artist?: string };
}

export interface LastFmArtistTopTrack {
  name?: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  artist?: {
    name?: string;
    mbid?: string;
    url?: string;
  };
  image?: Image[];
  "@attr"?: { rank?: string };
}

export interface LastFmArtistTopTracks {
  track?: LastFmArtistTopTrack[] | LastFmArtistTopTrack;
  "@attr"?: {
    artist?: string;
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}

export interface LastFmArtistTopAlbum {
  name?: string;
  playcount?: string | number;
  mbid?: string;
  url?: string;
  artist?: {
    name?: string;
    mbid?: string;
    url?: string;
  };
  image?: Image[];
  "@attr"?: { rank?: string };
}

export interface LastFmArtistTopAlbums {
  album?: LastFmArtistTopAlbum[] | LastFmArtistTopAlbum;
  "@attr"?: {
    artist?: string;
    page?: string;
    perPage?: string;
    totalPages?: string;
    total?: string;
  };
}

export interface LastFmSearchArtist {
  name?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: Image[];
}

export interface LastFmSearchArtists {
  "opensearch:Query"?: {
    "#text"?: string;
    role?: string;
    searchTerms?: string;
    startPage?: string;
  };
  "opensearch:totalResults"?: string;
  "opensearch:startIndex"?: string;
  "opensearch:itemsPerPage"?: string;
  artistmatches?: {
    artist?: LastFmSearchArtist[] | LastFmSearchArtist;
  };
  "@attr"?: { for?: string };
}
