export interface ValidationRule<T> {
  check: (value: T) => boolean;
  message: string;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationResult = { success: true; error?: never } | { success: false; error: string };

export function validateInputs<T extends object>(input: T, rules: ValidationRules<T>): ValidationResult {
  const keys = Object.keys(rules) as (keyof T & string)[];

  for (const key of keys) {
    const fieldRules = rules[key];
    if (!fieldRules) continue;

    const value = input[key];

    for (const rule of fieldRules) {
      if (!rule.check(value)) {
        return {
          success: false,
          error: `Invalid field '${key}': ${rule.message}`,
        };
      }
    }
  }

  return { success: true };
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
export function isValidLimit(value: unknown, max = 100): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= max;
}

export function isValidInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isValidTimestamp(value: unknown): value is number {
  if (typeof value !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  const twoWeeksAgo = now - 14 * 24 * 60 * 60;

  return value >= twoWeeksAgo && value <= now;
}

export function isEmptyItem(value: unknown): unknown {
  return !isNonEmptyString(value) && value && typeof value === "object" && Object.keys(value).length === 0;
}
