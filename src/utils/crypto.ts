import { createHash } from "node:crypto";

interface generateApiSignatureOptions {
  secret: string;
  params: Record<string, string>;
}

export function generateApiSignature({ secret, params }: generateApiSignatureOptions): string {
  // eslint-disable-next-line unicorn/no-array-sort
  const keys = Object.keys(params).sort();

  let string_ = "";
  for (const key of keys) {
    string_ += key + params[key];
  }

  string_ += secret;

  return createHash("md5").update(string_, "utf8").digest("hex");
}
