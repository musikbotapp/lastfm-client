import type { Image } from "../types/api-shared";

export function flattenImages(images?: Image[]): Record<string, string> {
  const result: Record<string, string> = {};
  if (!images) return result;

  for (const img of images) {
    if (img.size && img["#text"]) {
      result[img.size] = img["#text"];
    }
  }
  return result;
}
