import type { Image } from "@local-types/shared";

export function flattenImages(images?: Image[]): Record<string, string> {
  const result: Record<string, string> = {};
  if (!images) return result;

  for (const img of images) {
    // eslint-disable-next-line unicorn/explicit-length-check
    if (img.size && img["#text"]) {
      result[img.size] = img["#text"];
    }
  }
  return result;
}
