import { isNonEmptyString, isValidInteger, isValidLimit, validateInputs } from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { LastFmClient } from "@/client";
import type {
  LastFmUser,
  LastFmUserLovedTracks,
  LastFmUserRecentTracks,
  LastFmUserTopAlbums,
  LastFmUserTopArtists,
  LastFmUserTopTracks,
  UserGetLovedTracksOptions,
  UserGetRecentTracksOptions,
  UserGetTopAlbumsOptions,
  UserGetTopArtistsOptions,
  UserGetTopTracksOptions,
  UserInfoResponse,
  UserLovedTracksResponse,
  UserNowPlayingResponse,
  UserRecentTracksResponse,
  UserTopAlbumsResponse,
  UserTopArtistsResponse,
  UserTopTracksResponse,
} from "../types/user";

export class UserStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Get information about a user profile.
   *
   * @param user - The user to fetch info for.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, user: object }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_USER_DATA" | number | string, errorMsg: string }`
   */
  public async getInfo(user: string): Promise<UserInfoResponse> {
    if (!isNonEmptyString(user)) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: "Must be a non-empty string" };
    }

    const response = await this.#client.rest.get<{ user?: LastFmUser }>("user.getinfo", {
      signature: false,
      params: { user },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const userData = response.data.user;
    if (!userData) return { success: false, errorCode: "NO_USER_DATA", errorMsg: "No user info found" };

    const registeredRaw = userData.registered?.unixtime ?? userData.registered?.["#text"];

    const parsedUserData = {
      name: parseString(userData.name),
      age: parseNumber(userData.age),
      subscriber: userData.subscriber !== "0",
      realname: parseString(userData.realname),
      bootstrap: parseString(userData.bootstrap),
      scrobbles: parseNumber(userData.playcount),
      playlists: parseNumber(userData.playlists),
      uniqueArtists: parseNumber(userData.artist_count),
      uniqueTracks: parseNumber(userData.track_count),
      uniqueAlbums: parseNumber(userData.album_count),
      images: parseImages(userData.image),
      registered: { unix: parseNumber(registeredRaw) },
      country: parseString(userData.country),
      gender: parseString(userData.gender),
      url: parseString(userData.url),
      type: parseString(userData.type),
    };

    return { success: true, user: parsedUserData };
  }

  /**
   * Get tracks loved by a user.
   *
   * @param options - The options. See {@link UserGetLovedTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, lovedTracks: Array, totalLoved: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_LOVED_TRACKS" | number | string, errorMsg: string }`
   */
  public async getLovedTracks(options: UserGetLovedTracksOptions): Promise<UserLovedTracksResponse> {
    const { user, limit, page } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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

    const response = await this.#client.rest.get<{ lovedtracks?: LastFmUserLovedTracks }>("user.getlovedtracks", {
      signature: false,
      params: {
        user,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.lovedtracks?.track);
    if (!data) return { success: false, errorCode: "NO_LOVED_TRACKS", errorMsg: "No loved tracks found" };

    const total = response.data.lovedtracks?.["@attr"]?.total;
    const lovedTracks = data.map((t) => {
      return {
        streamable: !(String(t.streamable?.fulltrack) === "0" || String(t.streamable?.["#text"]) === "0"),
        name: parseString(t.name),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        date: {
          unix: parseNumber(t.date?.uts),
          readableString: parseString(t.date?.["#text"]),
        },
        mbid: parseString(t.mbid),
        url: parseString(t.url),
        images: parseImages(t.image),
      };
    });

    return { success: true, lovedTracks, totalLoved: parseNumber(total) };
  }

  /**
   * Get a list of the recent tracks listened to by this user.
   *
   * @param options - The options. See {@link UserGetRecentTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, recentTracks: Array, nowPlaying: boolean }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_RECENT_TRACKS" | number | string, errorMsg: string }`
   */
  public async getRecentTracks(options: UserGetRecentTracksOptions): Promise<UserRecentTracksResponse> {
    const { user, limit, page } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (value): boolean => value === undefined || isValidLimit(value, 1000),
          message: "Must be a positive integer up to 1000",
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

    const response = await this.#client.rest.get<{ recenttracks?: LastFmUserRecentTracks }>("user.getrecenttracks", {
      signature: false,
      params: {
        user,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.recenttracks?.track);
    if (!data) return { success: false, errorCode: "NO_RECENT_TRACKS", errorMsg: "No recent tracks found" };

    const recentTracks = data.map((r) => {
      return {
        streamable: String(r.streamable) !== "0",
        name: parseString(r.name),
        artist: {
          name: parseString(r.artist?.["#text"]),
          mbid: parseString(r.artist?.mbid),
        },
        album: {
          name: parseString(r.album?.["#text"]),
          mbid: parseString(r.album?.mbid),
        },
        url: parseString(r.url),
        mbid: parseString(r.mbid),
        images: parseImages(r.image),
        date: {
          unix: parseNumber(r.date?.uts),
          readableString: parseString(r.date?.["#text"]),
        },
      };
    });

    return { success: true, recentTracks, nowPlaying: !!data[0]?.["@attr"]?.nowplaying };
  }

  /**
   * Get the top tracks listened to by a user. You can stipulate a time period. Sends the overall chart by default.
   *
   * @param options - The options. See {@link UserGetTopTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topTracks: Array, uniqueTracks: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_TRACKS" | number | string, errorMsg: string }`
   */
  public async getTopTracks(options: UserGetTopTracksOptions): Promise<UserTopTracksResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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
      period: [
        {
          check: (value): boolean => value === undefined || isNonEmptyString(value),
          message: "Must be a non-empty string",
        },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.get<{ toptracks?: LastFmUserTopTracks }>("user.gettoptracks", {
      signature: false,
      params: {
        user,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
        ...(period !== undefined && { period }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.toptracks?.track);
    if (!data) return { success: false, errorCode: "NO_TOP_TRACKS", errorMsg: "No top tracks found" };

    const total = response.data.toptracks?.["@attr"]?.total;
    const topTracks = data.map((t) => {
      return {
        streamable: !(String(t.streamable?.fulltrack) === "0" || String(t.streamable?.["#text"]) === "0"),
        mbid: parseString(t.mbid),
        name: parseString(t.name),
        images: parseImages(t.image),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        url: parseString(t.url),
        duration: parseNumber(t.duration),
        rank: parseNumber(t["@attr"]?.rank),
        playcount: parseNumber(t.playcount),
      };
    });

    return { success: true, topTracks, uniqueTracks: parseNumber(total) };
  }

  /**
   * Get the top artists listened to by a user. You can stipulate a time period. Sends the overall chart by default.
   *
   * @param options - The options. See {@link UserGetTopArtistsOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topArtists: Array, uniqueArtists: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_ARTISTS" | number | string, errorMsg: string }`
   */
  public async getTopArtists(options: UserGetTopArtistsOptions): Promise<UserTopArtistsResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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
      period: [
        {
          check: (value): boolean => value === undefined || isNonEmptyString(value),
          message: "Must be a non-empty string",
        },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.get<{ topartists?: LastFmUserTopArtists }>("user.gettopartists", {
      signature: false,
      params: {
        user,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
        ...(period !== undefined && { period }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topartists?.artist);
    if (!data) return { success: false, errorCode: "NO_TOP_ARTISTS", errorMsg: "No top artists found" };

    const total = response.data.topartists?.["@attr"]?.total;
    const topArtists = data.map((a) => {
      return {
        streamable: String(a.streamable) !== "0",
        images: parseImages(a.image),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        playcount: parseNumber(a.playcount),
        rank: parseNumber(a["@attr"]?.rank),
        name: parseString(a.name),
      };
    });

    return { success: true, topArtists, uniqueArtists: parseNumber(total) };
  }

  /**
   * Get the top albums listened to by a user. You can stipulate a time period. Sends the overall chart by default.
   *
   * @param options - The options. See {@link UserGetTopAlbumsOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topAlbums: Array, uniqueAlbums: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_ALBUMS" | number | string, errorMsg: string }`
   */
  public async getTopAlbums(options: UserGetTopAlbumsOptions): Promise<UserTopAlbumsResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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
      period: [
        {
          check: (value): boolean => value === undefined || isNonEmptyString(value),
          message: "Must be a non-empty string",
        },
      ],
    });

    if (!success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.#client.rest.get<{ topalbums?: LastFmUserTopAlbums }>("user.gettopalbums", {
      signature: false,
      params: {
        user,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
        ...(period !== undefined && { period }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topalbums?.album);
    if (!data) return { success: false, errorCode: "NO_TOP_ALBUMS", errorMsg: "No top albums found" };

    const total = response.data.topalbums?.["@attr"]?.total;
    const topAlbums = data.map((a) => {
      return {
        artist: {
          name: parseString(a.artist?.name),
          url: parseString(a.artist?.url),
          mbid: parseString(a.artist?.mbid),
        },
        images: parseImages(a.image),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        playcount: parseNumber(a.playcount),
        rank: parseNumber(a["@attr"]?.rank),
        name: parseString(a.name),
      };
    });

    return { success: true, topAlbums, uniqueAlbums: parseNumber(total) };
  }

  /**
   * Get the now playing track of this user.
   *
   * @param user - The last.fm username to fetch now playing track of.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, track: object }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NOT_PLAYING" | "TRACK_UNAVAILABLE" | number | string, errorMsg: string }`
   */
  public async getNowPlaying(user: string): Promise<UserNowPlayingResponse> {
    const response = await this.getRecentTracks({ user, limit: 1 });

    if (!response.success) {
      return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };
    }

    if (!response.nowPlaying) {
      return { success: false, errorCode: "NOT_PLAYING", errorMsg: "User is not listening currently" };
    }

    const data = response.recentTracks[0];
    if (!data) {
      return { success: false, errorCode: "TRACK_UNAVAILABLE", errorMsg: "The track details are unavailable" };
    }

    const track = {
      streamable: data.streamable,
      name: data.name,
      artist: {
        name: data.artist.name,
        mbid: data.artist.mbid,
      },
      album: {
        name: data.album.name,
        mbid: data.album.mbid,
      },
      url: data.url,
      mbid: data.mbid,
      images: data.images,
    };

    return { success: true, track };
  }
}
