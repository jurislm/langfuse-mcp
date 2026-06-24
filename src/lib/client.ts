import { Langfuse } from "langfuse";
import { getBaseUrl } from "./api.js";

let _client: Langfuse | null = null;

export function getLangfuseClient(): Langfuse {
  if (!_client) {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    if (!publicKey || !secretKey) {
      throw new Error("LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be configured");
    }
    _client = new Langfuse({
      publicKey,
      secretKey,
      baseUrl: getBaseUrl(),
      requestTimeout: 30_000,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

/** Reset the singleton — only for use in tests. */
export function resetLangfuseClient(): void {
  _client = null;
}
