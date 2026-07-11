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
import type { LastFmContext } from "../internal/context";
import type { AlbumSearchOptions, AlbumSearchResponse, LastFmSearchAlbums } from "../types/album";

export class AlbumStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * Search for an album by name. Returns album matches sorted by relevance.
   * @param options
   * @param options.album The album name.
   * @param options.limit The number of results to fetch per page. (optional) (default 30, max 200)
   * @param options.page The page number to fetch. Defaults to first page. (optional)
   * @returns A promise that resolves to the API response object.
   * - **Success**: { success: true, albums: Array, totalResultsOnLastFm: number | null }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | "NO_ALBUM_MATCHES" | number | string, errorMsg: string }
   */
  public async search(options: AlbumSearchOptions): Promise<AlbumSearchResponse> {
    const { album, limit, page } = options;

    const validation = validateInputs(options, {
      album: [{ check: isNonEmptyString, message: "Must be a non-empty string" }],
      limit: [
        {
          check: (val) => val === undefined || isValidLimit(val, 200),
          message: "Must be a positive integer up to 200",
        },
      ],
      page: [{ check: (val) => val === undefined || isValidInteger(val), message: "Must be a positive integer" }],
    });

    if (!validation.success) {
      this.c.emit("warn", { apiMethod: "album.search", message: validation.error });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: validation.error };
    }

    const response = await this.c.sendRequest<{ results?: LastFmSearchAlbums }>({
      method: "GET",
      request: {
        apiMethod: "album.search",
        signature: false,
        params: {
          album,
          ...(limit !== undefined && { limit }),
          ...(page !== undefined && { page }),
        },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    const data = normalizeArray(response.data.results?.albummatches?.album);
    if (!data) return { success: false, errorCode: "NO_ALBUM_MATCHES", errorMsg: "No matches found." };

    const results = response.data.results?.["opensearch:totalResults"];
    const albums = data.map((a) => {
      return {
        streamable: !(a.streamable === "0"),
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
