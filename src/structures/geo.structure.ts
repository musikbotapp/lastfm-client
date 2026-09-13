import { isNonEmptyString, isValidInteger, isValidLimit, validateInputs } from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { LastFmClient } from "@/client";
import type {
  GeoGetTopArtistsOptions,
  GeoGetTopTracksOptions,
  GeoTopArtistsResponse,
  GeoTopTracksResponse,
  LastFmGeoTopArtists,
  LastFmGeoTopTracks,
} from "../types/geo";

export class GeoStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Get the most popular tracks on Last.fm last week by country.
   *
   * @param options - The options. See {@link GeoGetTopTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topTracks: Array }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "GEO_NO_TOP_TRACKS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.geo.getTopTracks({
   *   country: "Spain",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Top track in Spain: ${res.topTracks[0].name}`);
   * }
   * ```
   */
  public async getTopTracks(options: GeoGetTopTracksOptions): Promise<GeoTopTracksResponse> {
    const { country, location, limit, page } = options;

    const { success, error } = validateInputs(options, {
      country: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      location: [
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

    const response = await this.#client.rest.get<{ tracks?: LastFmGeoTopTracks }>("geo.gettoptracks", {
      signature: false,
      params: {
        country: country.trim(),
        ...(location && { location: location.trim() }),
        ...(limit && { limit }),
        ...(page && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.tracks?.track);
    if (!data) return { success: false, errorCode: "GEO_NO_TOP_TRACKS", errorMsg: "No top tracks found" };

    const isZeroIndexed = parseNumber(data[0]?.["@attr"]?.rank) === 0;

    const topTracks = data.map((t) => {
      const rank = parseNumber(t["@attr"]?.rank);
      return {
        streamable: !(t.streamable?.["#text"] === "0" || t.streamable?.fulltrack === "0"),
        name: parseString(t.name),
        duration: parseNumber(t.duration),
        listeners: parseNumber(t.listeners),
        mbid: parseString(t.mbid),
        url: parseString(t.url),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        images: parseImages(t.image),
        rank: isZeroIndexed && rank !== null ? rank + 1 : rank,
      };
    });

    return { success: true, topTracks };
  }

  /**
   * Get the most popular artists on Last.fm by country.
   *
   * @param options - The options. See {@link GeoGetTopArtistsOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, topArtists: Array }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "GEO_NO_TOP_ARTISTS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.geo.getTopArtists({
   *   country: "Japan",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Top artist in Japan: ${res.topArtists[0].name}`);
   * }
   * ```
   */
  public async getTopArtists(options: GeoGetTopArtistsOptions): Promise<GeoTopArtistsResponse> {
    const { country, limit, page } = options;

    const { success, error } = validateInputs(options, {
      country: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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

    const response = await this.#client.rest.get<{ topartists?: LastFmGeoTopArtists }>("geo.gettopartists", {
      signature: false,
      params: {
        country: country.trim(),
        ...(limit && { limit }),
        ...(page && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topartists?.artist);
    if (!data) return { success: false, errorCode: "GEO_NO_TOP_ARTISTS", errorMsg: "No top artists found" };

    const isZeroIndexed = parseNumber(data[0]?.["@attr"]?.rank) === 0;

    const topArtists = data.map((a) => {
      const rank = parseNumber(a["@attr"]?.rank);
      return {
        streamable: a.streamable !== "0",
        name: parseString(a.name),
        listeners: parseNumber(a.listeners),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        images: parseImages(a.image),
        rank: isZeroIndexed && rank !== null ? rank + 1 : rank,
      };
    });

    return { success: true, topArtists };
  }
}
