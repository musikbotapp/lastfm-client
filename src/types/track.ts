import type { BaseFailureResponse, BaseSuccessResponse, Image, ResolvedImages } from "./api-shared";
import type { CustomMetadata, ResponseError } from "./context";

// ======================================================================
// REQUEST OPTIONS
// ======================================================================

interface BaseOptions {
  track: string;
  artist: string;
}

interface ExtendedBaseOptions extends BaseOptions {
  sk: string;
  duration?: number;
  meta?: CustomMetadata;
}

export interface ScrobbleOptions extends ExtendedBaseOptions {
  timestamp: number;
  chosenByUser?: boolean;
}

export interface ScrobbleBatchOptions {
  sk: string;
  tracks: {
    artist: string;
    track: string;
    timestamp: number;
    chosenByUser?: boolean;
    duration?: number;
  }[];
  meta?: CustomMetadata;
}

export type UpdateNowPlayingOptions = ExtendedBaseOptions;

export interface TrackGetSimilarOptions extends BaseOptions {
  limit?: number;
  autoCorrect?: boolean;
}

export interface TrackLoveOptions extends BaseOptions {
  sk: string;
  meta?: CustomMetadata;
}

export interface TrackUnLoveOptions extends BaseOptions {
  sk: string;
  meta?: CustomMetadata;
}

export interface TrackSearchOptions {
  track: string;
  artist?: string;
  limit?: number;
  page?: number;
}

// ======================================================================
// RESPONSES
// ======================================================================

export type ScrobbleResponse = BaseSuccessResponse | BaseFailureResponse;
export type ScrobbleBatchResponse =
  | (BaseSuccessResponse & { scrobbledCount: number })
  | (BaseFailureResponse & { scrobbledCount: number });

export type UpdateNowPlayingResponse = BaseSuccessResponse | BaseFailureResponse;

interface SimilarTrackSuccessResponse extends BaseSuccessResponse {
  similarTracks: SimilarTrack[];
  trackName: string;
  artistName: string;
}

interface SimilarTrackFailureResponse extends BaseFailureResponse {
  errorCode: ResponseError | "NO_SIMILAR_TRACKS";
  similarTracks?: never;
  trackName?: never;
  artistName?: never;
}

export type SimilarTrackResponse = SimilarTrackSuccessResponse | SimilarTrackFailureResponse;

export type LoveResponse = BaseSuccessResponse | BaseFailureResponse;
export type UnLoveResponse = BaseSuccessResponse | BaseFailureResponse;

interface TrackSearchSuccessResponse extends BaseSuccessResponse {
  tracks: SearchResultTrack[];
  totalResultsOnLastFm: number | null;
}

interface TrackSearchFailureResponse extends BaseFailureResponse {
  tracks?: never;
  totalResultsOnLastFm?: never;
  errorCode: ResponseError | "NO_TRACK_MATCHES";
}

export type TrackSearchResponse = TrackSearchSuccessResponse | TrackSearchFailureResponse;

// ======================================================================
// RESPONSE SHAPES
// ======================================================================

export interface SimilarTrack {
  streamable: boolean | null;
  name: string | null;
  artist: {
    name: string | null;
    mbid: string | null;
    url: string | null;
  };
  url: string | null;
  mbid: string | null;
  duration: number | null;
  match: number | null;
  playcount: number | null;
  images: ResolvedImages;
}

export interface SearchResultTrack {
  streamable: boolean;
  name: string | null;
  artist: string | null;
  url: string | null;
  mbid: string | null;
  listeners: number | null;
  images: ResolvedImages;
}

// ======================================================================
// RAW LAST.FM API RESPONSE SHAPES
// ======================================================================

export interface LastFmSimilarTrack {
  name?: string;
  playcount?: string | number;
  mbid?: string;
  match?: string | number;
  url?: string;
  streamable?: {
    "#text"?: string;
    fulltrack?: string;
  };
  duration?: string | number;
  artist?: {
    name?: string;
    mbid?: string;
    url?: string;
  };
  image: Image[];
}

export interface LastFmSimilarTracks {
  track?: LastFmSimilarTrack[] | LastFmSimilarTrack;
  "@attr"?: { artist?: string; track?: string };
}

export interface LastFmSearchTrack {
  name?: string;
  artist?: string;
  url?: string;
  streamable?: string;
  listeners?: string;
  image?: Image[];
  mbid?: string;
}

export interface LastFmSearchTracks {
  "opensearch:Query"?: {
    "#text"?: string;
    role?: string;
    searchTerms?: string;
    startPage?: string;
  };
  "opensearch:totalResults"?: string;
  "opensearch:startIndex"?: string;
  "opensearch:itemsPerPage"?: string;
  trackmatches?: {
    track?: LastFmSearchTrack[] | LastFmSearchTrack;
  };
  "@attr"?: { for?: string };
}
