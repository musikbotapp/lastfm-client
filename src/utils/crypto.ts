import { createHash } from "node:crypto";

type generateApiSignatureOptions = { secret: string; params: Record<string, string> };

export function generateApiSignature({ secret, params }: generateApiSignatureOptions): string {
  const keys = Object.keys(params).sort();

  let str = "";
  for (const key of keys) {
    str += key + params[key];
  }

  str += secret;

  return createHash("md5").update(str, "utf8").digest("hex");
}
