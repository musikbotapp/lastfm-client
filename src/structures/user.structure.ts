import {
  isNonEmptyString,
  isValidLimit,
  validateInputs,
  parseImages,
  parseNumber,
  parseString,
  isValidInteger,
  normalizeArray,
} from "../utils";
import type { LastFmContext } from "../internal/context";
import type {
  LastFmUser,
  LastFmUserLovedTracks,
  LastFmUserRecentTracks,
  LastFmUserTopAlbums,
  LastFmUserTopArtists,
  LastFmUserTopTracks,
  UserGetInfoOptions,
  UserGetLovedTracksOptions,
  UserGetRecentTracksOptions,
  UserGetTopAlbumsOptions,
  UserGetTopArtistsOptions,
  UserGetTopTracksOptions,
  UserInfoResponse,
  UserLovedTracksResponse,
  UserGetNowPlayingOptions,
  UserNowPlayingResponse,
  UserRecentTracksResponse,
  UserTopAlbumsResponse,
  UserTopArtistsResponse,
  UserTopTracksResponse,
} from "../types/user";

export class UserStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * Get information about a user profile.
   * @param options
   * @param options.user The user to fetch info for.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, user: object }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_USER_DATA" | number | string, errorMsg: string }
   */
  public async getInfo(options: UserGetInfoOptions): Promise<UserInfoResponse> {
    const { user } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.getinfo", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ user?: LastFmUser }>({
      method: "GET",
      request: {
        apiMethod: "user.getinfo",
        signature: false,
        params: {
          user,
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const userData = response.data.user;
    if (!userData) return { success: false, errorCode: "NO_USER_DATA", errorMsg: "No user info found" };

    const registeredRaw = userData.registered?.unixtime ?? userData.registered?.["#text"];

    const parsedUserData = {
      name: parseString(userData.name),
      age: parseNumber(userData.age),
      subscriber: !(userData.subscriber === "0"),
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
   * @param options
   * @param options.user The user name to fetch the loved tracks for.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page The page number to fetch. (optional) (default first page)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, lovedTracks: Array, totalLoved: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_LOVED_TRACKS" | number | string, errorMsg: string }
   */
  public async getLovedTracks(options: UserGetLovedTracksOptions): Promise<UserLovedTracksResponse> {
    const { user, limit, page } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.getlovedtracks", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ lovedtracks?: LastFmUserLovedTracks }>({
      method: "GET",
      request: {
        apiMethod: "user.getlovedtracks",
        signature: false,
        params: {
          user,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
        },
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
   * @param options
   * @param options.user The last.fm username to fetch the recent tracks of.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 1000)
   * @param options.page The page number to fetch. (optional) (default first page)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, recentTracks: Array, nowPlaying: boolean }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_RECENT_TRACKS" | number | string, errorMsg: string }
   */
  public async getRecentTracks(options: UserGetRecentTracksOptions): Promise<UserRecentTracksResponse> {
    const { user, limit, page } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 1000),
          message: "Must be a positive integer up to 1000",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.getrecenttracks", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ recenttracks?: LastFmUserRecentTracks }>({
      method: "GET",
      request: {
        apiMethod: "user.getrecenttracks",
        signature: false,
        params: {
          user,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.recenttracks?.track);
    if (!data) return { success: false, errorCode: "NO_RECENT_TRACKS", errorMsg: "No recent tracks found" };

    const recentTracks = data.map((r) => {
      return {
        streamable: !(String(r.streamable) === "0"),
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
   * @param options
   * @param options.user The user name to fetch top tracks for.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page  The page number to fetch. (optional) (default first page)
   * @param options.period The time period over which to retrieve top tracks for. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topTracks: Array, uniqueTracks: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_TRACKS" | number | string, errorMsg: string }
   */
  public async getTopTracks(options: UserGetTopTracksOptions): Promise<UserTopTracksResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
      period: [{ check: (val) => val === undefined || isNonEmptyString(val), message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.gettoptracks", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ toptracks?: LastFmUserTopTracks }>({
      method: "GET",
      request: {
        apiMethod: "user.gettoptracks",
        signature: false,
        params: {
          user,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
          ...(period !== undefined && { period }),
        },
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
   * @param options
   * @param options.user The user name to fetch top artists for.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page  The page number to fetch. (optional) (default first page)
   * @param options.period The time period over which to retrieve top artists for. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topArtists: Array, uniqueArtists: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_ARTISTS" | number | string, errorMsg: string }
   */
  public async getTopArtists(options: UserGetTopArtistsOptions): Promise<UserTopArtistsResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
      period: [{ check: (val) => val === undefined || isNonEmptyString(val), message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.gettopartists", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ topartists?: LastFmUserTopArtists }>({
      method: "GET",
      request: {
        apiMethod: "user.gettopartists",
        signature: false,
        params: {
          user,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
          ...(period !== undefined && { period }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topartists?.artist);
    if (!data) return { success: false, errorCode: "NO_TOP_ARTISTS", errorMsg: "No top artists found" };

    const total = response.data.topartists?.["@attr"]?.total;
    const topArtists = data.map((a) => {
      return {
        streamable: !(String(a.streamable) === "0"),
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
   * @param options
   * @param options.user The user name to fetch top albums for.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page The page number to fetch. (optional) (default first page)
   * @param options.period The time period over which to retrieve top albums for. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topAlbums: Array, uniqueAlbums: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_ALBUMS" | number | string, errorMsg: string }
   */
  public async getTopAlbums(options: UserGetTopAlbumsOptions): Promise<UserTopAlbumsResponse> {
    const { user, limit, page, period } = options;

    const { success, error } = validateInputs(options, {
      user: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
      period: [{ check: (val) => val === undefined || isNonEmptyString(val), message: "Must be a non-empty string" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "user.gettopalbums", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ topalbums?: LastFmUserTopAlbums }>({
      method: "GET",
      request: {
        apiMethod: "user.gettopalbums",
        signature: false,
        params: {
          user,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
          ...(period !== undefined && { period }),
        },
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
   * @param options
   * @param options.user The last.fm username to fetch now playing track of.
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, track: object }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NOT_PLAYING" | number | string, errorMsg: string }
   */
  public async getNowPlaying(options: UserGetNowPlayingOptions): Promise<UserNowPlayingResponse> {
    const { user } = options;

    const response = await this.getRecentTracks({ user, limit: 1 });

    if (!response.success) {
      return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };
    }

    if (!response.nowPlaying) {
      return { success: false, errorCode: "NOT_PLAYING", errorMsg: "User is not listening currently" };
    }

    const data = response.recentTracks[0];
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
