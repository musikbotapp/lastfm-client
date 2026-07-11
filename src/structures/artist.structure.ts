import {
  isNonEmptyString,
  isValidBoolean,
  isValidInteger,
  isValidLimit,
  normalizeArray,
  parseImages,
  parseNumber,
  parseString,
  validateInputs,
} from "../utils";
import type { LastFmContext } from "../internal/context";
import type {
  ArtistGetSimilarOptions,
  ArtistGetTopAlbumsOptions,
  ArtistGetTopTracksOptions,
  ArtistSearchOptions,
  ArtistSearchResponse,
  ArtistTopAlbumsResponse,
  ArtistTopTracksResponse,
  LastFmArtistTopAlbums,
  LastFmArtistTopTracks,
  LastFmSearchArtists,
  LastFmSimilarArtists,
  SimilarArtistResponse,
} from "../types/artist";

export class ArtistStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * Get all the artists similar to this artist.
   * @param options
   * @param options.artist The artist name.
   * @param options.limit Limit the number of similar artists returned. (optional) (default 50, max 200)
   * @param options.autoCorrect Transform misspelled artist names into correct artist names, returning the correct version instead. The corrected artist name will be returned in the response. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, similarArtists: Array, artistName: string }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_SIMILAR_ARTISTS" | number | string, errorMsg: string }
   */
  public async getSimilar(options: ArtistGetSimilarOptions): Promise<SimilarArtistResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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
      this.c.emit("warn", { apiMethod: "artist.getsimilar", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ similarartists?: LastFmSimilarArtists }>({
      method: "GET",
      request: {
        apiMethod: "artist.getsimilar",
        signature: false,
        params: {
          artist,
          autoCorrect: (autoCorrect ?? this.c.config.behavior.autoCorrectByDefault) ? 1 : 0,
          ...(limit !== undefined && { limit }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.similarartists?.artist);
    if (!data) return { success: false, errorCode: "NO_SIMILAR_ARTISTS", errorMsg: "No similar artists found" };

    const attr = response.data.similarartists?.["@attr"];
    const similarArtists = data.map((a) => {
      return {
        streamable: !(a.streamable === "0"),
        name: parseString(a.name),
        mbid: parseString(a.mbid),
        match: parseNumber(a.match),
        url: parseString(a.url),
        images: parseImages(a.image),
      };
    });

    return { success: true, similarArtists, artistName: parseString(attr?.artist) ?? artist };
  }

  /**
   * Get the top tracks by an artist on Last.fm, ordered by popularity
   * @param options
   * @param options.artist The artist name.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.autoCorrect Transform misspelled artist names into correct artist names, returning the correct version instead. The corrected artist name will be returned in the response. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topTracks: Array, artistName: string }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "ARTIST_NO_TOP_TRACKS" | number | string, errorMsg: string }
   */
  public async getTopTracks(options: ArtistGetTopTracksOptions): Promise<ArtistTopTracksResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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
      this.c.emit("warn", { apiMethod: "artist.gettoptracks", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ toptracks?: LastFmArtistTopTracks }>({
      method: "GET",
      request: {
        apiMethod: "artist.gettoptracks",
        signature: false,
        params: {
          artist,
          autoCorrect: (autoCorrect ?? this.c.config.behavior.autoCorrectByDefault) ? 1 : 0,
          ...(limit !== undefined && { limit }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.toptracks?.track);
    if (!data) return { success: false, errorCode: "ARTIST_NO_TOP_TRACKS", errorMsg: "No top tracks found" };

    const attr = response.data.toptracks?.["@attr"];
    const topTracks = data.map((t) => {
      return {
        streamable: !(t.streamable === "0"),
        name: parseString(t.name),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        playcount: parseNumber(t.playcount),
        listeners: parseNumber(t.listeners),
        mbid: parseString(t.mbid),
        url: parseString(t.url),
        images: parseImages(t.image),
        rank: parseNumber(t["@attr"]?.rank),
      };
    });

    return { success: true, topTracks, artistName: parseString(attr?.artist) ?? artist };
  }

  /**
   * Get the top albums for an artist on Last.fm, ordered by popularity.
   * @param options
   * @param options.artist The artist name.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.autoCorrect Transform misspelled artist names into correct artist names, returning the correct version instead. The corrected artist name will be returned in the response. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topAlbums: Array, artistName: string }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "ARTIST_NO_TOP_ALBUMS" | number | string, errorMsg: string }
   */
  public async getTopAlbums(options: ArtistGetTopAlbumsOptions): Promise<ArtistTopAlbumsResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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
      this.c.emit("warn", { apiMethod: "artist.gettopalbums", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ topalbums?: LastFmArtistTopAlbums }>({
      method: "GET",
      request: {
        apiMethod: "artist.gettopalbums",
        signature: false,
        params: {
          artist,
          autoCorrect: (autoCorrect ?? this.c.config.behavior.autoCorrectByDefault) ? 1 : 0,
          ...(limit !== undefined && { limit }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topalbums?.album);
    if (!data) return { success: false, errorCode: "ARTIST_NO_TOP_ALBUMS", errorMsg: "No top albums found" };

    const attr = response.data.topalbums?.["@attr"];
    const topAlbums = data.map((a) => {
      return {
        name: parseString(a.name),
        playcount: parseNumber(a.playcount),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        artist: {
          name: parseString(a.artist?.name),
          mbid: parseString(a.artist?.mbid),
          url: parseString(a.artist?.url),
        },
        images: parseImages(a.image),
        rank: parseNumber(a["@attr"]?.rank),
      };
    });

    return { success: true, topAlbums, artistName: parseString(attr?.artist) ?? artist };
  }

  /**
   * Search for an artist by name. Returns artist matches sorted by relevance.
   * @param options
   * @param options.artist The artist name.
   * @param options.limit The number of results to fetch per page. (optional) (default 30, max 200)
   * @param options.page The page number to fetch. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, artists: Array, totalResultsOnLastFm: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_ARTIST_MATCHES" | number | string, errorMsg: string }
   */
  public async search(options: ArtistSearchOptions): Promise<ArtistSearchResponse> {
    const { artist, limit, page } = options;

    const { success, error } = validateInputs(options, {
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "artist.search", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ results?: LastFmSearchArtists }>({
      method: "GET",
      request: {
        apiMethod: "artist.search",
        signature: false,
        params: {
          artist,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.artistmatches?.artist);
    if (!data) return { success: false, errorCode: "NO_ARTIST_MATCHES", errorMsg: "No artists found" };

    const results = response.data.results?.["opensearch:totalResults"];
    const artists = data.map((a) => {
      return {
        streamable: !(a.streamable === "0"),
        name: parseString(a.name),
        listeners: parseNumber(a.listeners),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        images: parseImages(a.image),
      };
    });

    return { success: true, artists, totalResultsOnLastFm: parseNumber(results) };
  }
}
