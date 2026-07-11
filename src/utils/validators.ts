export interface ValidationRule<T> {
  check: (value: T) => boolean;
  message: string;
}

export function validateInputs<T extends Record<string, any>>(
  input: T,
  rules: { [K in keyof T]?: ValidationRule<T[K]>[] },
): { success: true; error?: never } | { success: false; error: string } {
  for (const key in rules) {
    const value = input[key];
    const fieldRules = rules[key];

    if (fieldRules) {
      for (const rule of fieldRules) {
        if (!rule.check(value)) {
          return { success: false, error: `Invalid field '${key}': ${rule.message}` };
        }
      }
    }
  }
  return { success: true };
}

export const isNonEmptyString = (val: unknown): val is string => typeof val === "string" && val.trim().length > 0;

export const isValidBoolean = (val: unknown): val is boolean => typeof val === "boolean";

export const isValidLimit = (val: unknown, max = 100): val is number => {
  return typeof val === "number" && Number.isInteger(val) && val > 0 && val <= max;
};

export const isValidInteger = (val: unknown): val is number => {
  return typeof val === "number" && Number.isInteger(val) && val > 0;
};

export const isValidTimestamp = (val: unknown): val is number => {
  if (typeof val !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  const twoWeeksAgo = now - 14 * 24 * 60 * 60;

  return val >= twoWeeksAgo && val <= now;
};

export const isEmptyItem = (val: unknown) => {
  return !isNonEmptyString(val) && val && typeof val === "object" && Object.keys(val).length === 0;
};
