import type { LastFmContext } from "../internal/context";
import type {
  GeoGetTopArtistsOptions,
  GeoGetTopTracksOptions,
  GeoTopArtistsResponse,
  GeoTopTracksResponse,
  LastFmGeoTopArtists,
  LastFmGeoTopTracks,
} from "../types/geo";
import {
  isNonEmptyString,
  isValidInteger,
  isValidLimit,
  normalizeArray,
  parseImages,
  parseNumber,
  parseString,
  validateInputs,
} from "../utils";

export class GeoStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * Get the most popular tracks on Last.fm last week by country
   * @param options
   * @param options.country A country name, as defined by the ISO 3166-1 country names standard.
   * @param options.location A metro name, to fetch the charts for (must be within the country specified) (optional)
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page The page number to fetch. (optional) (default first page)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topTracks: Array }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "GEO_NO_TOP_TRACKS" | number | string, errorMsg: string }
   */
  public async getTopTracks(options: GeoGetTopTracksOptions): Promise<GeoTopTracksResponse> {
    const { country, location, limit, page } = options;

    const { success, error } = validateInputs(options, {
      country: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      location: [{ check: (val) => val === undefined || isNonEmptyString(val), message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "geo.gettoptracks", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ tracks?: LastFmGeoTopTracks }>({
      method: "GET",
      request: {
        apiMethod: "geo.gettoptracks",
        signature: false,
        params: {
          country: country.trim(),
          ...(location && { location: location.trim() }),
          ...(limit && { limit }),
          ...(page && { page }),
        },
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
   * Get the most popular artists on Last.fm by country
   * @param options
   * @param options.country A country name, as defined by the ISO 3166-1 country names standard.
   * @param options.limit The number of results to fetch per page. (optional) (default 50, max 200)
   * @param options.page The page number to fetch. (optional) (default first page)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, topArtists: Array }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "GEO_NO_TOP_ARTISTS" | number | string, errorMsg: string }
   */
  public async getTopArtists(options: GeoGetTopArtistsOptions): Promise<GeoTopArtistsResponse> {
    const { country, limit, page } = options;

    const { success, error } = validateInputs(options, {
      country: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!success) {
      this.c.emit("warn", { apiMethod: "geo.gettopartists", message: error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: error };
    }

    const response = await this.c.sendRequest<{ topartists?: LastFmGeoTopArtists }>({
      method: "GET",
      request: {
        apiMethod: "geo.gettopartists",
        signature: false,
        params: {
          country: country.trim(),
          ...(limit && { limit }),
          ...(page && { page }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.topartists?.artist);
    if (!data) return { success: false, errorCode: "GEO_NO_TOP_ARTISTS", errorMsg: "No top artists found" };

    const isZeroIndexed = parseNumber(data[0]?.["@attr"]?.rank) === 0;

    const topArtists = data.map((a) => {
      const rank = parseNumber(a["@attr"]?.rank);
      return {
        streamable: !(a.streamable === "0"),
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
