import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./api-shared";
import type { ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

export interface UserGetInfoOptions {
  user: string;
}

export interface UserGetLovedTracksOptions {
  user: string;
  limit?: number;
  page?: number;
}

export type UserGetRecentTracksOptions = UserGetLovedTracksOptions;

export type Period = "7day" | "1month" | "3month" | "6month" | "12month" | "overall";

export interface UserGetTopTracksOptions extends UserGetLovedTracksOptions {
  period?: Period;
}

export type UserGetTopArtistsOptions = UserGetTopTracksOptions;

export type UserGetTopAlbumsOptions = UserGetTopTracksOptions;

export type UserGetNowPlayingOptions = UserGetInfoOptions;

// ======================================================================
// RESPONSES
// ======================================================================

interface UserInfoSuccessResponse extends BaseSuccessResponse {
  user: UserInfo;
}

interface UserInfoFailureResponse extends BaseFailureResponse {
  user?: never;
  errorCode: ResponseError | "NO_USER_DATA";
}

export type UserInfoResponse = UserInfoSuccessResponse | UserInfoFailureResponse;

interface UserLovedTracksSuccessResponse extends BaseSuccessResponse {
  lovedTracks: UserLovedTrack[];
  totalLoved: number | null;
}

interface UserLovedTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_LOVED_TRACKS";
  lovedTracks?: never;
  totalLoved?: never;
}

export type UserLovedTracksResponse = UserLovedTracksSuccessResponse | UserLovedTracksFailureResponse;

interface UserRecentTracksSuccessResponse extends BaseSuccessResponse {
  recentTracks: UserRecentTrack[];
  nowPlaying: boolean;
}

interface UserRecentTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_RECENT_TRACKS";
  recentTracks?: never;
  nowPlaying?: never;
}

export type UserRecentTracksResponse = UserRecentTracksSuccessResponse | UserRecentTracksFailureResponse;

interface UserTopTracksSuccessResponse extends BaseSuccessResponse {
  topTracks: UserTopTrack[];
  uniqueTracks: number | null;
}

interface UserTopTracksFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_TOP_TRACKS";
  topTracks?: never;
  uniqueTracks?: never;
}

export type UserTopTracksResponse = UserTopTracksSuccessResponse | UserTopTracksFailureResponse;

interface UserTopArtistsSuccessResponse extends BaseSuccessResponse {
  topArtists: UserTopArtist[];
  uniqueArtists: number | null;
}

interface UserTopArtistsFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_TOP_ARTISTS";
  topArtists?: never;
  uniqueArtists?: never;
}

export type UserTopArtistsResponse = UserTopArtistsSuccessResponse | UserTopArtistsFailureResponse;

interface UserTopAlbumsSuccessResponse extends BaseSuccessResponse {
  topAlbums: UserTopAlbum[];
  uniqueAlbums: number | null;
}

interface UserTopAlbumsFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_TOP_ALBUMS";
  topAlbums?: never;
  uniqueAlbums?: never;
}

export type UserTopAlbumsResponse = UserTopAlbumsSuccessResponse | UserTopAlbumsFailureResponse;

interface UserNowPlayingSuccessResponse extends BaseSuccessResponse {
  track: UserNowPlayingTrack;
}

interface UserNowPlayingFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NOT_PLAYING";
  track?: never;
}

export type UserNowPlayingResponse = UserNowPlayingSuccessResponse | UserNowPlayingFailureResponse;

// ======================================================================
// RESPONSE SHAPES
// ======================================================================

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

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

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
