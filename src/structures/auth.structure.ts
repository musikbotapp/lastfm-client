import { isNonEmptyString } from "@utils/validators";

import type { LastFmClient } from "@/client";
import type { LastFmSession, SessionResponse, TokenResponse } from "../types/auth";

export class AuthStructure {
  readonly #client: LastFmClient;

  public constructor(client: LastFmClient) {
    this.#client = client;
  }

  /**
   * This will return a token. It's valid for 60 minutes from the moment it's granted.
   *
   * @returns Token needed in {@link getUrl} and {@link getSession} to obtain session key for the user.
   * - **Success**: `{ success: true, token: string }`
   * - **Failure**: `{ success: false, errorCode: "NO_TOKEN" | number | null, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.auth.getToken();
   *
   * if (res.success) {
   *   console.log(`Token: ${res.token}`);
   * }
   * ```
   */
  public async getToken(): Promise<TokenResponse> {
    const response = await this.#client.rest.get<{ token?: string }>("auth.gettoken", {
      signature: true,
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };
    if (!response.data.token) return { success: false, errorCode: "NO_TOKEN", errorMsg: "No token found" };

    return { success: true, token: response.data.token };
  }

  /**
   * Constructs Last.fm authentication site URL from the API key and token.
   *
   * @param token - Authentication token from {@link getToken}.
   * @returns URL to Last.fm app authentication site, or `false` if the provided token is an empty string.
   * @example
   * ```ts
   * const url = fm.auth.getUrl("your_auth_token");
   *
   * if (url) {
   *   console.log(`Auth URL: ${url}`);
   * }
   * ```
   */
  public getUrl(token: string): string | false {
    if (!isNonEmptyString(token)) {
      return false;
    }

    return `https://www.last.fm/api/auth?api_key=${this.#client.config.api.key}&token=${token}`;
  }

  /**
   * Constructs Last.fm authentication site URL from the API key and URL.
   * Last.fm will redirect to your callback URL, supplying an authentication token as a GET variable.
   *
   * @param url - Custom callback URL.
   * @returns URL to Last.fm app authentication site with callback URL, or `false` if the provided URL is an empty string.
   * @example
   * ```ts
   * const callbackUrl = fm.auth.getCallbackUrl("https://example.com/callback");
   *
   * if (callbackUrl) {
   *   console.log(`Auth URL with callback: ${callbackUrl}`);
   * }
   * ```
   */
  public getCallbackUrl(url: string): string | false {
    if (!isNonEmptyString(url)) {
      return false;
    }

    return `https://www.last.fm/api/auth?api_key=${this.#client.config.api.key}&cb=${url}`;
  }

  /**
   * Fetches a valid session from Last.fm for specified token.
   *
   * @param token - Same authentication token used in {@link getUrl}.
   * @returns Session response.
   * - **Success**: `{ success: true, session: LastFmSession }`
   * - **Failure**: `{ success: false, errorCode: "MISSING_REQUIREMENTS" | number | string, errorMsg: string }`
   * @example
   * ```ts
   * const res = await fm.auth.getSession("authorized_token");
   *
   * if (res.success) {
   *   console.log(`Session key: ${res.session.key}`);
   * }
   * ```
   */
  public async getSession(token: string): Promise<SessionResponse> {
    if (!isNonEmptyString(token)) {
      return { success: false, errorCode: "MISSING_REQUIREMENTS", errorMsg: "Token must be a non-empty string" };
    }

    const response = await this.#client.rest.get<{ session: LastFmSession }>("auth.getsession", {
      signature: true,
      params: { token },
    });

    if (!response.success) return { success: false, errorCode: response.errorCode, errorMsg: response.errorMsg };

    return { success: true, session: response.data.session };
  }
}
