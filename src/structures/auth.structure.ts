import { isNonEmptyString } from "../utils";
import type { LastFmContext } from "../internal/context";
import type {
  GetCallbackUrlOptions,
  GetSessionOptions,
  GetUrlOptions,
  LastFmSession,
  SessionResponse,
  TokenResponse,
} from "../types/auth";

export class AuthStructure {
  constructor(private readonly c: LastFmContext) {}

  /**
   * This will return a token. It's valid for 60 minutes from the moment it's granted.
   * @returns Token needed in {@link getUrl} and {@link getSession} to obtain session key for the user.
   * - **Success**: { success: true, token: string }
   * - **Failure**: { success: false, errorCode: "NO_TOKEN" | number | null, errorMsg: string }
   */
  public async getToken(): Promise<TokenResponse> {
    const response = await this.c.sendRequest<{ token?: string }>({
      method: "GET",
      request: {
        apiMethod: "auth.gettoken",
        signature: true,
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };
    if (!response.data.token) return { success: false, errorCode: "NO_TOKEN", errorMsg: "No token found" };

    return { success: true, token: response.data.token };
  }

  /**
   * Constructs Last.fm authentication site URL from the API key and token.
   * @param options.token Authentication token from {@link getToken}.
   * @returns URL to Last.fm application authentication site, or `false` if the provided token is an empty string.
   */
  public getUrl({ token }: GetUrlOptions): string | false {
    if (!isNonEmptyString(token)) {
      this.c.emit("warn", { apiMethod: null, message: "Token must be a non-empty string" });
      return false;
    }

    return `https://www.last.fm/api/auth?api_key=${this.c.config.api.key}&token=${token}`;
  }

  /**
   * Constructs Last.fm authentication site URL from the API key and URL.
   * Last.fm will redirect to your callback url, supplying an authentication token as a GET variable.
   * @param options.url Custom callback URL.
   * @returns URL to Last.fm application authentication site with callback URL, or `false` if the provided URL is an empty string.
   */
  public getCallbackUrl({ url }: GetCallbackUrlOptions): string | false {
    if (!isNonEmptyString(url)) {
      this.c.emit("warn", { apiMethod: null, message: "Callback URL must be a non-empty string" });
      return false;
    }

    return `https://www.last.fm/api/auth?api_key=${this.c.config.api.key}&cb=${url}`;
  }

  /**
   * Fetches a valid session from Last.fm for specified token.
   * @param options.token Same authentication token used in {@link getUrl}.
   * @returns Session response.
   * - **Success**: { success: true, session: LastFmSession }
   * - **Failure**: { success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }
   */
  public async getSession({ token }: GetSessionOptions): Promise<SessionResponse> {
    if (!isNonEmptyString(token)) {
      this.c.emit("warn", { apiMethod: "auth.getsession", message: "Token must be a non-empty string" });
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: "Token must be a non-empty string" };
    }

    const response = await this.c.sendRequest<{ session: LastFmSession }>({
      method: "GET",
      request: {
        apiMethod: "auth.getsession",
        signature: true,
        params: { token },
      },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true, session: response.data.session };
  }
}
