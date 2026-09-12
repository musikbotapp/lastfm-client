import { isEmptyItem } from "@utils/validators";
import { flattenImages } from "@utils/flatten-images";
import type { Image } from "@local-types/shared";

export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "string" && value.length > 0) {
    const number = Number(value);
    return Number.isNaN(number) ? null : number;
  }

  return null;
}

export function parseString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

export function parseImages(imagesArray: Image[] | undefined): Record<string, string> | null {
  if (!imagesArray) return null;
  const flattened = flattenImages(imagesArray);
  return Object.keys(flattened).length > 0 ? flattened : null;
}

export function normalizeArray<T>(value: T | T[] | null | undefined): T[] | null {
  if (!value) return null;
  const array = Array.isArray(value) ? value : [value];
  if (array.length === 0 || !array[0]) return null;
  if (isEmptyItem(array[0])) return null;
  return array;
}
