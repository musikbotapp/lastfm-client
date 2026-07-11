import type { LastFmContext } from "../internal/context";
import type { APIRequestOptions } from "../types/context";
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
import {
  isNonEmptyString,
  isValidBoolean,
  isValidInteger,
  isValidLimit,
  isValidTimestamp,
  normalizeArray,
  parseImages,
  parseNumber,
  parseString,
  validateInputs,
} from "../utils";

export class TrackStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * Used to add a track-play to a user's profile.
   * @param options
   * @param options.sk The Last.fm session key.
   * @param options.artist The artist name.
   * @param options.track The track name.
   * @param options.timestamp The time the track started playing, in UNIX timestamp format (integer number of seconds since 00:00:00, January 1st 1970 UTC). This must be in the UTC time zone.
   * @param options.chosenByUser `true` if the user chose this song, or `false` if the song was chosen by someone else (such as a radio station or recommendation service). (optional)
   * @param options.duration The length of the track in seconds. (optional)
   * @param options.meta Custom metadata for `sessionExpire` event.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }
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
      this.c.emit("warn", { apiMethod: "track.scrobble", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest({
      method: "POST",
      request: {
        apiMethod: "track.scrobble",
        signature: true,
        params: {
          sk,
          artist,
          track,
          timestamp,
          ...(duration !== undefined && duration > 0 && { duration }),
          ...(chosenByUser !== undefined && { chosenByUser: chosenByUser ? 1 : 0 }),
        },
      },
      meta,
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Used to add multiple track-plays to a user's profile.
   * @param options
   * @param options.sk The Last.fm session key.
   * @param options.tracks The array of tracks to scrobble. [{ track, artist, timestamp, duration (optional), chosenByUser (optional) }, ...]
   * @param options.meta Custom metadata for `sessionExpire` event.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, scrobbledCount: number }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string, scrobbledCount: number }
   */
  public async scrobbleBatch(options: ScrobbleBatchOptions): Promise<ScrobbleBatchResponse> {
    const { sk, tracks, meta } = options;

    const len = tracks.length;

    if (!sk || !len) {
      return {
        success: false,
        errorCode: "MISSING_REQUIREMENTS",
        errorMsg: "Missing required details",
        scrobbledCount: 0,
      };
    }

    const CHUNK_SIZE = 50;

    for (let i = 0; i < len; i += CHUNK_SIZE) {
      const chunk = tracks.slice(i, i + CHUNK_SIZE);
      const params: APIRequestOptions["params"] = { sk };

      chunk.forEach((t, index) => {
        params[`artist[${index}]`] = t.artist;
        params[`track[${index}]`] = t.track;
        params[`timestamp[${index}]`] = t.timestamp;
        if (t.chosenByUser !== undefined) params[`chosenByUser[${index}]`] = t.chosenByUser ? 1 : 0;
        if (t.duration && t.duration > 0) params[`duration[${index}]`] = t.duration;
      });

      const response = await this.c.sendRequest({
        method: "POST",
        request: {
          apiMethod: "track.scrobble",
          signature: true,
          params,
        },
        meta,
      });

      if (!response.success) {
        return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg, scrobbledCount: i };
      }
    }

    return { success: true, scrobbledCount: len };
  }

  /**
   * Used to notify Last.fm that a user has started listening to a track.
   * @param options
   * @param options.sk The Last.fm session key.
   * @param options.artist The artist name.
   * @param options.track The track name.
   * @param options.duration The length of the track in seconds. (optional)
   * @param options.meta Custom metadata for `sessionExpire` event.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }
   */
  public async updateNowPlaying(options: UpdateNowPlayingOptions): Promise<UpdateNowPlayingResponse> {
    const { sk, artist, track, duration, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "track.updatenowplaying", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest({
      method: "POST",
      request: {
        apiMethod: "track.updatenowplaying",
        signature: true,
        params: {
          sk,
          artist,
          track,
          ...(duration !== undefined && duration > 0 && { duration }),
        },
      },
      meta,
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Get the similar tracks for this track on Last.fm, based on listening data.
   * @param options
   * @param options.track The track name.
   * @param options.artist The artist name.
   * @param options.limit Maximum number of similar tracks to return. (optional) (default 50, max 200)
   * @param options.autoCorrect Transform misspelled artist names into correct artist names, returning the correct version instead. The corrected artist name will be returned in the response. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, similarTracks: Array, trackName: string, artistName: string }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_SIMILAR_TRACKS" | number | string, errorMsg: string }
   */
  public async getSimilar(options: TrackGetSimilarOptions): Promise<SimilarTrackResponse> {
    const { track, artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      autoCorrect: [{ check: (val) => val === undefined || isValidBoolean(val), message: "Must be a valid boolean" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "track.getsimilar", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ similartracks?: LastFmSimilarTracks }>({
      method: "GET",
      request: {
        apiMethod: "track.getsimilar",
        signature: false,
        params: {
          track,
          artist,
          autoCorrect: (autoCorrect ?? this.c.config.behavior.autoCorrectByDefault) ? 1 : 0,
          ...(limit !== undefined && { limit }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.similartracks?.track);
    if (!data) return { success: false, errorCode: "NO_SIMILAR_TRACKS", errorMsg: "No similar tracks found" };

    const attr = response.data.similartracks?.["@attr"];
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
      trackName: parseString(attr?.track) ?? track,
      artistName: parseString(attr?.artist) ?? artist,
    };
  }

  /**
   * Love a track for a user profile.
   * @param options
   * @param options.sk The Last.fm session key.
   * @param options.track The track name.
   * @param options.artist The artist name.
   * @param options.meta Custom metadata for `sessionExpire` event.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }
   */
  public async love(options: TrackLoveOptions): Promise<LoveResponse> {
    const { sk, track, artist, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "track.love", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest({
      method: "POST",
      request: {
        apiMethod: "track.love",
        signature: true,
        params: {
          sk,
          track,
          artist,
        },
      },
      meta,
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * UnLove a track for a user profile.
   * @param options
   * @param options.sk The Last.fm session key.
   * @param options.track The track name.
   * @param options.artist The artist name.
   * @param options.meta Custom metadata for `sessionExpire` event.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }
   */
  public async unlove(options: TrackUnLoveOptions): Promise<UnLoveResponse> {
    const { sk, track, artist, meta } = options;

    const { success, error } = validateInputs(options, {
      sk: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "track.unlove", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest({
      method: "POST",
      request: {
        apiMethod: "track.unlove",
        signature: true,
        params: {
          sk,
          track,
          artist,
        },
      },
      meta,
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true };
  }

  /**
   * Search for a track by track name. Returns track matches sorted by relevance.
   * @param options
   * @param options.track The track name.
   * @param options.artist Narrow your search by specifying an artist. (optional)
   * @param options.limit The number of results to fetch per page. (optional) (default 30, max 200)
   * @param options.page The page number to fetch. Defaults to first page. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, tracks: Array, totalResultsOnLastFm: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TRACK_MATCHES" | number | string, errorMsg: string }
   */
  public async search(options: TrackSearchOptions): Promise<TrackSearchResponse> {
    const { track, artist, limit, page } = options;

    const { success, error } = validateInputs(options, {
      track: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      artist: [{ check: (val) => val === undefined || isNonEmptyString(val), message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "track.search", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ results?: LastFmSearchTracks }>({
      method: "GET",
      request: {
        apiMethod: "track.search",
        signature: false,
        params: {
          track,
          ...(artist !== undefined && { artist }),
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.trackmatches?.track);
    if (!data) return { success: false, errorCode: "NO_TRACK_MATCHES", errorMsg: "No results found" };

    const results = response.data.results?.["opensearch:totalResults"];
    const tracks = data.map((t) => {
      return {
        streamable: !(t.streamable === "0"),
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
