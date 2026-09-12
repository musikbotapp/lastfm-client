import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./shared";

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

export interface UserInfoSuccessResponse extends BaseSuccessResponse {
  user: UserInfo;
}

export interface UserInfoFailureResponse extends BaseFailureResponse {
  user?: never;
}

export type UserInfoResponse = UserInfoSuccessResponse | UserInfoFailureResponse;

export interface UserLovedTracksSuccessResponse extends BaseSuccessResponse {
  lovedTracks: UserLovedTrack[];
  totalLoved: number | null;
}

export interface UserLovedTracksFailureResponse extends BaseFailureResponse {
  lovedTracks?: never;
  totalLoved?: never;
}

export type UserLovedTracksResponse = UserLovedTracksSuccessResponse | UserLovedTracksFailureResponse;

export interface UserRecentTracksSuccessResponse extends BaseSuccessResponse {
  recentTracks: UserRecentTrack[];
  nowPlaying: boolean;
}

export interface UserRecentTracksFailureResponse extends BaseFailureResponse {
  recentTracks?: never;
  nowPlaying?: never;
}

export type UserRecentTracksResponse = UserRecentTracksSuccessResponse | UserRecentTracksFailureResponse;

export interface UserTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: UserTopTrack[];
  uniqueTracks: number | null;
}

export interface UserTopTracksFailureResponse extends BaseFailureResponse {
  topTracks?: never;
  uniqueTracks?: never;
}

export type UserTopTracksResponse = UserTopTracksSuccessResponse | UserTopTracksFailureResponse;

export interface UserTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: UserTopArtist[];
  uniqueArtists: number | null;
}

export interface UserTopArtistsFailureResponse extends BaseFailureResponse {
  topArtists?: never;
  uniqueArtists?: never;
}

export type UserTopArtistsResponse = UserTopArtistsSuccessResponse | UserTopArtistsFailureResponse;

export interface UserTopAlbumsSuccessResponse extends BaseSuccessResponse {
  topAlbums: UserTopAlbum[];
  uniqueAlbums: number | null;
}

export interface UserTopAlbumsFailureResponse extends BaseFailureResponse {
  topAlbums?: never;
  uniqueAlbums?: never;
}

export type UserTopAlbumsResponse = UserTopAlbumsSuccessResponse | UserTopAlbumsFailureResponse;

export interface UserNowPlayingSuccessResponse extends BaseSuccessResponse {
  track: UserNowPlayingTrack;
}

export interface UserNowPlayingFailureResponse extends BaseFailureResponse {
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
