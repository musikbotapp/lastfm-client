import {
  isNonEmptyString,
  isBoolean,
  isValidInteger,
  isValidLimit,
  isValidTimestamp,
  validateInputs,
} from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { LastFmClient } from "@/client";
import type {
  LastFmSearchTracks,
  LastFmSimilarTracks,
  LoveResponse,
  ScrobbleBatchOptions,
  ScrobbleBatchResponse,
  ScrobbleOptions,
  ScrobbleResponse,
  SimilarTrackResponse,
  TrackGetSimilarOptions,
  TrackLoveOptions,
  TrackSearchOptions,
  TrackSearchResponse,
  TrackUnLoveOptions,
  UnLoveResponse,
  UpdateNowPlayingOptions,
  UpdateNowPlayingResponse,
} from "../types/track";
import type { RequestData } from "@/types/rest";

export class TrackStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Used to add a track-play to a user's profile.
   *
   * @param options - The options. See {@link ScrobbleOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }`
   */
  public async scrobble(options: ScrobbleOptions): Promise<ScrobbleResponse> {
    const { sk, artist, track, timestamp, chosenByUser, duration, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      timestamp: [
        { check: isValidTimestamp, message: "Must be the UNIX timestamp (in seconds) of the song's start time." },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.post("track.scrobble", {
      signature: true,
      params: {
        sk,
        artist,
        track,
        timestamp,
        ...(duration !== undefined && duration > 0 && { duration }),
        ...(chosenByUser !== undefined && { chosenByUser: chosenByUser ? 1 : 0 }),
      },
      ...(meta && { meta }),
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Used to add multiple track-plays to a user's profile.
   *
   * @param options - The options. See {@link ScrobbleBatchOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, scrobbledCount: number }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string, scrobbledCount: number }`
   */
  public async scrobbleBatch(options: ScrobbleBatchOptions): Promise<ScrobbleBatchResponse> {
    const { sk, tracks, meta } = options;

    const length = tracks.length;

    if (!sk || !length) {
      return {
        success: false,
        errorCode: "MISSING_REQUIREMENTS",
        errorMsg: "Missing required details",
        scrobbledCount: 0,
      };
    }

    const CHUNK_SIZE = 50;

    for (let index = 0; index < length; index += CHUNK_SIZE) {
      const chunk = tracks.slice(index, index + CHUNK_SIZE);
      const parameters: RequestData["params"] = { sk };

      for (const [index, t] of chunk.entries()) {
        parameters[`artist[${index}]`] = t.artist;
        parameters[`track[${index}]`] = t.track;
        parameters[`timestamp[${index}]`] = t.timestamp;
        if (t.chosenByUser !== undefined) parameters[`chosenByUser[${index}]`] = t.chosenByUser ? 1 : 0;
        if (t.duration && t.duration > 0) parameters[`duration[${index}]`] = t.duration;
      }

      const response = await this.#client.rest.post("track.scrobble", {
        signature: true,
        params: parameters,
        ...(meta && { meta }),
      });

      if (!response.success) {
        return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg, scrobbledCount: index };
      }
    }

    return { success: true, scrobbledCount: length };
  }

  /**
   * Used to notify Last.fm that a user has started listening to a track.
   *
   * @param options - The options. See {@link UpdateNowPlayingOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }`
   */
  public async updateNowPlaying(options: UpdateNowPlayingOptions): Promise<UpdateNowPlayingResponse> {
    const { sk, artist, track, duration, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.post("track.updatenowplaying", {
      signature: true,
      params: {
        sk,
        artist,
        track,
        ...(duration !== undefined && duration > 0 && { duration }),
      },
      ...(meta && { meta }),
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Get the similar tracks for this track on Last.fm, based on listening data.
   *
   * @param options - The options. See {@link TrackGetSimilarOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, similarTracks: Array, trackName: string, artistName: string }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_SIMILAR_TRACKS" | number | string, errorMsg: string }`
   */
  public async getSimilar(options: TrackGetSimilarOptions): Promise<SimilarTrackResponse> {
    const { track, artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (value): boolean => value === undefined || isValidLimit(value, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      autoCorrect: [
        { check: (value): boolean => value === undefined || isBoolean(value), message: "Must be a valid boolean" },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.get<{ similartracks?: LastFmSimilarTracks }>("track.getsimilar", {
      signature: false,
      params: {
        track,
        artist,
        autoCorrect: (autoCorrect ?? this.#client.config.behavior.autoCorrectByDefault) ? 1 : 0,
        ...(limit !== undefined && { limit }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.similartracks?.track);
    if (!data) return { success: false, errorCode: "NO_SIMILAR_TRACKS", errorMsg: "No similar tracks found" };

    const attribute = response.data.similartracks?.["@attr"];
    const similarTracks = data.map((t) => {
      return {
        streamable: !(String(t.streamable?.fulltrack) === "0" || String(t.streamable?.["#text"]) === "0"),
        name: parseString(t.name),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        url: parseString(t.url),
        mbid: parseString(t.mbid),
        duration: parseNumber(t.duration),
        match: parseNumber(t.match),
        playcount: parseNumber(t.playcount),
        images: parseImages(t.image),
      };
    });

    return {
      success: true,
      similarTracks,
      trackName: parseString(attribute?.track) ?? track,
      artistName: parseString(attribute?.artist) ?? artist,
    };
  }

  /**
   * Love a track for a user profile.
   *
   * @param options - The options. See {@link TrackLoveOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }`
   */
  public async love(options: TrackLoveOptions): Promise<LoveResponse> {
    const { sk, track, artist, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.post("track.love", {
      signature: true,
      params: {
        sk,
        track,
        artist,
      },
      ...(meta && { meta }),
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * UnLove a track for a user profile.
   *
   * @param options - The options. See {@link TrackUnLoveOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }`
   */
  public async unlove(options: TrackUnLoveOptions): Promise<UnLoveResponse> {
    const { sk, track, artist, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.post("track.unlove", {
      signature: true,
      params: {
        sk,
        track,
        artist,
      },
      ...(meta && { meta }),
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Search for a track by track name. Returns track matches sorted by relevance.
   *
   * @param options - The options. See {@link TrackSearchOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, tracks: Array, totalResultsOnLastFm: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TRACK_MATCHES" | number | string, errorMsg: string }`
   */
  public async search(options: TrackSearchOptions): Promise<TrackSearchResponse> {
    const { track, artist, limit, page } = options;

    const { success, error } = validateInputs(options, {
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [
        {
          check: (value): boolean => value === undefined || isNonEmptyString(value),
          message: "Must be a non-empty string",
        },
      ],
      limit: [
        {
          check: (value): boolean => value === undefined || isValidLimit(value, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [
        {
          check: (value): boolean => value === undefined || isValidInteger(value),
          message: "Must be a positive integer",
        },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.get<{ results?: LastFmSearchTracks }>("track.search", {
      signature: false,
      params: {
        track,
        ...(artist !== undefined && { artist }),
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.trackmatches?.track);
    if (!data) return { success: false, errorCode: "NO_TRACK_MATCHES", errorMsg: "No results found" };

    const results = response.data.results?.["opensearch:totalResults"];
    const tracks = data.map((t) => {
      return {
        streamable: t.streamable !== "0",
        name: parseString(t.name),
        artist: parseString(t.artist),
        url: parseString(t.url),
        mbid: parseString(t.mbid),
        listeners: parseNumber(t.listeners),
        images: parseImages(t.image),
      };
    });

    return { success: true, tracks, totalResultsOnLastFm: parseNumber(results) };
  }
}
