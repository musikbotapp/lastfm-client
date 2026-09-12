import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages, ResponseError } from "./shared";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #region Request Options
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface UserGetLovedTracksOptions {
  /**
   * The user name to fetch the loved tracks for.
   */
  user: string;
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
 * {@link UserGetLovedTracksOptions}
 */
export type UserGetRecentTracksOptions = UserGetLovedTracksOptions;

export type Period = "7day" | "1month" | "3month" | "6month" | "12month" | "overall";

/**
 * {@link UserGetLovedTracksOptions}
 */
export interface UserGetTopTracksOptions extends UserGetLovedTracksOptions {
  /**
   * The time period over which to retrieve top tracks for.
   */
  period?: Period;
}

/**
 * {@link UserGetTopTracksOptions}
 */
export type UserGetTopArtistsOptions = UserGetTopTracksOptions;

/**
 * {@link UserGetTopTracksOptions}
 */
export type UserGetTopAlbumsOptions = UserGetTopTracksOptions;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Responses
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

interface UserInfoSuccessResponse extends BaseSuccessResponse {
  user: UserInfo;
}

interface UserInfoFailureResponse extends BaseFailureResponse {
  user?: never;
  errorCode: ResponseError;
}

export type UserInfoResponse = UserInfoSuccessResponse | UserInfoFailureResponse;

interface UserLovedTracksSuccessResponse extends BaseSuccessResponse {
  lovedTracks: UserLovedTrack[];
  totalLoved: number | null;
}

interface UserLovedTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  lovedTracks?: never;
  totalLoved?: never;
}

export type UserLovedTracksResponse = UserLovedTracksSuccessResponse | UserLovedTracksFailureResponse;

interface UserRecentTracksSuccessResponse extends BaseSuccessResponse {
  recentTracks: UserRecentTrack[];
  nowPlaying: boolean;
}

interface UserRecentTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  recentTracks?: never;
  nowPlaying?: never;
}

export type UserRecentTracksResponse = UserRecentTracksSuccessResponse | UserRecentTracksFailureResponse;

interface UserTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: UserTopTrack[];
  uniqueTracks: number | null;
}

interface UserTopTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  topTracks?: never;
  uniqueTracks?: never;
}

export type UserTopTracksResponse = UserTopTracksSuccessResponse | UserTopTracksFailureResponse;

interface UserTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: UserTopArtist[];
  uniqueArtists: number | null;
}

interface UserTopArtistsFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  topArtists?: never;
  uniqueArtists?: never;
}

export type UserTopArtistsResponse = UserTopArtistsSuccessResponse | UserTopArtistsFailureResponse;

interface UserTopAlbumsSuccessResponse extends BaseSuccessResponse {
  topAlbums: UserTopAlbum[];
  uniqueAlbums: number | null;
}

interface UserTopAlbumsFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  topAlbums?: never;
  uniqueAlbums?: never;
}

export type UserTopAlbumsResponse = UserTopAlbumsSuccessResponse | UserTopAlbumsFailureResponse;

interface UserNowPlayingSuccessResponse extends BaseSuccessResponse {
  track: UserNowPlayingTrack;
}

interface UserNowPlayingFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError;
  track?: never;
}

export type UserNowPlayingResponse = UserNowPlayingSuccessResponse | UserNowPlayingFailureResponse;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface UserInfo {
  name: string | null;
  age: number | null;
  subscriber: boolean;
  realname: string | null;
  bootstrap: string | null;
  scrobbles: number | null;
  playlists: number | null;
  uniqueArtists: number | null;
  uniqueTracks: number | null;
  uniqueAlbums: number | null;
  images: ResolvedImages;
  registered: { unix: number | null };
  country: string | null;
  gender: string | null;
  url: string | null;
  type: string | null;
}

export interface UserLovedTrack {
  streamable: boolean;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  date: {
    unix: number | null;
    readableString: string | null;
  };
  mbid: string | null;
  url: string | null;
  images: ResolvedImages;
}

export interface UserRecentTrack {
  streamable: boolean;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
  };
  album: {
    name: string | null;
    mbid: string | null;
  };
  url: string | null;
  mbid: string | null;
  images: ResolvedImages;
  date: {
    unix: number | null;
    readableString: string | null;
  };
}

export interface UserTopTrack {
  streamable: boolean;
  mbid: string | null;
  name: string | null;
  images: ResolvedImages;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  url: string | null;
  duration: number | null;
  rank: number | null;
  playcount: number | null;
}

export interface UserTopArtist {
  streamable: boolean;
  images: ResolvedImages;
  mbid: string | null;
  url: string | null;
  playcount: number | null;
  rank: number | null;
  name: string | null;
}

export interface UserTopAlbum {
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  images: ResolvedImages;
  mbid: string | null;
  url: string | null;
  playcount: number | null;
  rank: number | null;
  name: string | null;
}

export interface UserNowPlayingTrack {
  streamable: boolean;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
  };
  album: {
    name: string | null;
    mbid: string | null;
  };
  url: string | null;
  mbid: string | null;
  images: ResolvedImages;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #endregion
// #region Raw Last.fm API Response Shapes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export interface LastFmUser {
  name?: string;
  age?: string;
  subscriber?: string;
  realname?: string;
  bootstrap?: string;
  playcount?: string;
  artist_count?: string;
  playlists?: string;
  track_count?: string;
  album_count?: string;
  image?: Image[];
  registered?: {
    unixtime?: string;
    "#text"?: string;
  };
  country?: string;
  gender?: string;
  url?: string;
  type?: string;
}

export interface LastFmUserLovedTrack {
  artist?: {
    url?: string;
    name?: string;
    mbid?: string;
  };
  date?: {
    uts?: string;
    "#text"?: string;
  };
  mbid?: string;
  url?: string;
  name?: string;
  image?: Image[];
  streamable?: { fulltrack?: string; "#text"?: string };
}

export interface LastFmUserLovedTracks {
  track?: LastFmUserLovedTrack[] | LastFmUserLovedTrack;
  "@attr"?: {
    user: string;
    totalPages?: string;
    page?: string;
    perPage?: string;
    total?: string;
  };
}

export interface LastFmUserRecentTrack {
  artist?: {
    mbid?: string;
    "#text"?: string;
  };
  streamable?: string;
  image?: Image[];
  mbid?: string;
  album?: {
    mbid?: string;
    "#text"?: string;
  };
  name?: string;
  "@attr"?: { nowplaying?: string };
  url?: string;
  date?: {
    uts?: string;
    "#text"?: string;
  };
}

export interface LastFmUserRecentTracks {
  track?: LastFmUserRecentTrack[] | LastFmUserRecentTrack;
  "@attr"?: {
    user?: string;
    totalPages?: string;
    page?: string;
    total?: string;
    perPage?: string;
  };
}

export interface LastFmUserTopTrack {
  streamable?: { fulltrack?: string; "#text"?: string };
  mbid?: string;
  name?: string;
  image?: Image[];
  artist?: {
    url?: string;
    name?: string;
    mbid?: string;
  };
  url?: string;
  duration?: string;
  "@attr"?: { rank?: string };
  playcount?: string;
}

export interface LastFmUserTopTracks {
  track?: LastFmUserTopTrack[] | LastFmUserTopTrack;
  "@attr"?: {
    user?: string;
    totalPages?: string;
    page?: string;
    perPage?: string;
    total?: string;
  };
}

export interface LastFmUserTopArtist {
  streamable?: string;
  image?: Image[];
  mbid?: string;
  url?: string;
  playcount?: string;
  "@attr"?: { rank?: string };
  name?: string;
}

export interface LastFmUserTopArtists {
  artist?: LastFmUserTopArtist[] | LastFmUserTopArtist;
  "@attr"?: {
    user?: string;
    totalPages?: string;
    page?: string;
    perPage?: string;
    total?: string;
  };
}

export interface LastFmUserTopAlbum {
  artist?: {
    url?: string;
    name?: string;
    mbid?: string;
  };
  image?: Image[];
  mbid?: string;
  url?: string;
  playcount?: string;
  "@attr"?: { rank?: string };
  name?: string;
}

export interface LastFmUserTopAlbums {
  album?: LastFmUserTopAlbum[] | LastFmUserTopAlbum;
  "@attr"?: {
    user?: string;
    totalPages?: string;
    page?: string;
    perPage?: string;
    total?: string;
  };
}
