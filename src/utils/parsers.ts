import { isEmptyItem, isNonEmptyString } from "./index";
import { flattenImages } from "./flatten-images";
import type { Image } from "../types/api-shared";

export function parseNumber(val: unknown): number | null {
  if (val === undefined || val === null) return null;
  const str = String(val);
  if (!isNonEmptyString(str)) return null;
  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

export function parseString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  return isNonEmptyString(val) ? val : null;
}

export function parseImages(imagesArray: Image[] | undefined): Record<string, string> | null {
  if (!imagesArray) return null;
  const flattened = flattenImages(imagesArray);
  return Object.keys(flattened).length > 0 ? flattened : null;
}

export function normalizeArray<T>(val: T | T[] | null | undefined): T[] | null {
  if (!val) return null;
  const arr = Array.isArray(val) ? val : [val];
  if (arr.length === 0 || !arr[0]) return null;
  if (isEmptyItem(arr[0])) return null;
  return arr;
}
