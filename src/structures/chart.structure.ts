import { isValidInteger, isValidLimit, validateInputs } from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { LastFmClient } from "@/client";
import type {
  ChartGetTopArtistsOptions,
  ChartGetTopTracksOptions,
  ChartTopArtistsResponse,
  ChartTopTracksResponse,
  LastFmChartTopArtists,
  LastFmChartTopTracks,
} from "@local-types/chart";

export class ChartStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Get the top tracks chart.
   *
   * @param options - The optional options. {@link ChartGetTopTracksOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, tracks: Array }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_TRACKS" | number | string, errorMsg: string }`
   */
  public async getTopTracks(options: ChartGetTopTracksOptions = {}): Promise<ChartTopTracksResponse> {
    const { limit, page } = options;

    const { success, error } = validateInputs(options, {
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

    const response = await this.#client.rest.get<{ tracks?: LastFmChartTopTracks }>("chart.gettoptracks", {
      signature: false,
      params: {
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.tracks?.track);
    if (!data) return { success: false, errorCode: "NO_TOP_TRACKS", errorMsg: "No top tracks found" };

    const topTracks = data.map((t) => {
      return {
        streamable: !(String(t.streamable?.fulltrack) === "0" || String(t.streamable?.["#text"]) === "0"),
        name: parseString(t.name),
        artist: {
          name: parseString(t.artist?.name),
          mbid: parseString(t.artist?.mbid),
          url: parseString(t.artist?.url),
        },
        duration: parseNumber(t.duration),
        playcount: parseNumber(t.playcount),
        listeners: parseNumber(t.listeners),
        mbid: parseString(t.mbid),
        url: parseString(t.url),
        images: parseImages(t.image),
      };
    });

    return { success: true, topTracks };
  }

  /**
   * Get the top artists chart.
   *
   * @param options - The optional options. See {@link ChartGetTopArtistsOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, artists: Array }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_TOP_ARTISTS" | number | string, errorMsg: string }`
   */
  public async getTopArtists(options: ChartGetTopArtistsOptions = {}): Promise<ChartTopArtistsResponse> {
    const { limit, page } = options;

    const { success, error } = validateInputs(options, {
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

    const response = await this.#client.rest.get<{ artists?: LastFmChartTopArtists }>("chart.gettopartists", {
      signature: false,
      params: {
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.artists?.artist);
    if (!data) return { success: false, errorCode: "NO_TOP_ARTISTS", errorMsg: "No top artists found" };

    const topArtists = data.map((a) => {
      return {
        streamable: a.streamable !== "0",
        name: parseString(a.name),
        playcount: parseNumber(a.playcount),
        listeners: parseNumber(a.listeners),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        images: parseImages(a.image),
      };
    });

    return { success: true, topArtists };
  }
}
