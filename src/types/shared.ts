export type CustomMetadata<T extends Record<string, unknown> = Record<string, unknown>> = T;

export interface BaseSuccessResponse {
  success: true;
  errorCode?: never;
  errorMsg?: never;
}

export interface BaseFailureResponse {
  success: false;
  errorCode: string | number;
  errorMsg: string;
}

export type ImageSizes = "small" | "medium" | "large" | "extralarge" | "mega";

export interface Image {
  "#text"?: string;
  size?: ImageSizes | "";
}

export type ResolvedImages = Record<ImageSizes, string> | null;
