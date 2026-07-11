export function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && typeof error.code === "string";
}

export function isDOMException(error: unknown): error is DOMException {
  return error instanceof DOMException || (error instanceof Error && error.name === "DOMException");
}
