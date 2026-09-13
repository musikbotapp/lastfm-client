import { isNonEmptyString, isValidInteger, isValidLimit, validateInputs } from "@/utils/validators";
import { normalizeArray, parseImages, parseNumber, parseString } from "@/utils/parsers";

import type { AlbumSearchOptions, AlbumSearchResponse, LastFmSearchAlbums } from "../types/album";
import type { LastFmClient } from "@/client";

export class AlbumStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * Search for an album by name. Returns album matches sorted by relevance.
   *
   * @param options - The search options. See {@link AlbumSearchOptions}.
   * @returns A promise that resolves to the API response object.
   * - **Success**: `{ success: true, albums: Array, totalResultsOnLastFm: number | null }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_ALBUM_MATCHES" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.album.search({
   *   album: "Hurry Up Tomorrow",
   *   limit: 5,
   * });
   *
   * if (res.success) {
   *   console.log(`Found ${res.albums.length} matching albums`);
   * }
   * ```
   */
  public async search(options: AlbumSearchOptions): Promise<AlbumSearchResponse> {
    const { album, limit, page } = options;

    const validation = validateInputs(options, {
      album: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
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

    if (!validation.success) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: validation.error };
    }

    const response = await this.#client.rest.get<{ results?: LastFmSearchAlbums }>("album.search", {
      signature: false,
      params: {
        album,
        ...(limit !== undefined && { limit }),
        ...(page !== undefined && { page }),
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.albummatches?.album);
    if (!data) return { success: false, errorCode: "NO_ALBUM_MATCHES", errorMsg: "No matches found." };

    const results = response.data.results?.["opensearch:totalResults"];
    const albums = data.map((a) => {
      return {
        streamable: a.streamable !== "0",
        name: parseString(a.name),
        artist: parseString(a.artist),
        mbid: parseString(a.mbid),
        url: parseString(a.url),
        images: parseImages(a.image),
      };
    });

    return { success: true, albums, totalResultsOnLastFm: parseNumber(results) };
  }
}
