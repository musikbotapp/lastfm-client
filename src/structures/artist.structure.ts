import { isNonEmptyString, isBoolean, isValidInteger, isValidLimit, validateInputs } from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { LastFmClient } from "@/client";
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
} from "@local-types/artist";

export class ArtistStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Get all the artists similar to this artist.
   *
   * @param options - The options. See {@link ArtistGetSimilarOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, similarArtists: Array, artistName: string }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_SIMILAR_ARTISTS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.artist.getSimilar({
   *   artist: "Michael Jackson",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Similar to Michael Jackson: ${res.similarArtists.map((a) => a.name).join(", ")}`);
   * }
   * ```
   */
  public async getSimilar(options: ArtistGetSimilarOptions): Promise<SimilarArtistResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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

    const response = await this.#client.rest.get<{ similarartists?: LastFmSimilarArtists }>("artist.getsimilar", {
      signature: false,
      params: {
        artist,
        autoCorrect: (autoCorrect ?? this.#client.config.behavior.autoCorrectByDefault) ? 1 : 0,
        ...(limit !== undefined && { limit }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.similarartists?.artist);
    if (!data) return { success: false, errorCode: "NO_SIMILAR_ARTISTS", errorMsg: "No similar artists found" };

    const attribute = response.data.similarartists?.["@attr"];
    const similarArtists = data.map((a) => {
      return {
        streamable: a.streamable !== "0",
        name: parseString(a.name),
        mbid: parseString(a.mbid),
        match: parseNumber(a.match),
        url: parseString(a.url),
        images: parseImages(a.image),
      };
    });

    return { success: true, similarArtists, artistName: parseString(attribute?.artist) ?? artist };
  }

  /**
   * Get the top tracks by an artist on Last.fm, ordered by popularity.
   *
   * @param options - The options. See {@link ArtistGetTopTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topTracks: Array, artistName: string }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "ARTIST_NO_TOP_TRACKS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.artist.getTopTracks({
   *   artist: "Daft Punk",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Top Daft Punk track: ${res.topTracks[0].name}`);
   * }
   * ```
   */
  public async getTopTracks(options: ArtistGetTopTracksOptions): Promise<ArtistTopTracksResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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

    const response = await this.#client.rest.get<{ toptracks?: LastFmArtistTopTracks }>("artist.gettoptracks", {
      signature: false,
      params: {
        artist,
        autoCorrect: (autoCorrect ?? this.#client.config.behavior.autoCorrectByDefault) ? 1 : 0,
        ...(limit !== undefined && { limit }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.toptracks?.track);
    if (!data) return { success: false, errorCode: "ARTIST_NO_TOP_TRACKS", errorMsg: "No top tracks found" };

    const attribute = response.data.toptracks?.["@attr"];
    const topTracks = data.map((t) => {
      return {
        streamable: t.streamable !== "0",
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

    return { success: true, topTracks, artistName: parseString(attribute?.artist) ?? artist };
  }

  /**
   * Get the top albums for an artist on Last.fm, ordered by popularity.
   *
   * @param options - The options. See {@link ArtistGetTopAlbumsOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topAlbums: Array, artistName: string }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "ARTIST_NO_TOP_ALBUMS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.artist.getTopAlbums({
   *   artist: "The Weeknd",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Top The Weeknd album: ${res.topAlbums[0].name}`);
   * }
   * ```
   */
  public async getTopAlbums(options: ArtistGetTopAlbumsOptions): Promise<ArtistTopAlbumsResponse> {
    const { artist, limit, autoCorrect } = options;

    const { success, error } = validateInputs(options, {
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

    const response = await this.#client.rest.get<{ topalbums?: LastFmArtistTopAlbums }>("artist.gettopalbums", {
      signature: false,
      params: {
        artist,
        autoCorrect: (autoCorrect ?? this.#client.config.behavior.autoCorrectByDefault) ? 1 : 0,
        ...(limit !== undefined && { limit }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topalbums?.album);
    if (!data) return { success: false, errorCode: "ARTIST_NO_TOP_ALBUMS", errorMsg: "No top albums found" };

    const attribute = response.data.topalbums?.["@attr"];
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

    return { success: true, topAlbums, artistName: parseString(attribute?.artist) ?? artist };
  }

  /**
   * Search for an artist by name. Returns artist matches sorted by relevance.
   *
   * @param options - The options. See {@link ArtistSearchOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, artists: Array, totalResultsOnLastFm: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_ARTIST_MATCHES" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.artist.search({
   *   artist: "Michael Jackson",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Found ${res.artists.length} matching artists`);
   * }
   * ```
   */
  public async search(options: ArtistSearchOptions): Promise<ArtistSearchResponse> {
    const { artist, limit, page } = options;

    const { success, error } = validateInputs(options, {
      artist: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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

    const response = await this.#client.rest.get<{ results?: LastFmSearchArtists }>("artist.search", {
      signature: false,
      params: {
        artist,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.artistmatches?.artist);
    if (!data) return { success: false, errorCode: "NO_ARTIST_MATCHES", errorMsg: "No artists found" };

    const results = response.data.results?.["opensearch:totalResults"];
    const artists = data.map((a) => {
      return {
        streamable: a.streamable !== "0",
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
