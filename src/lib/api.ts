/**
 * Langfuse API 客戶端
 *
 * 提供 REST API 呼叫助手，包含 Basic Auth 與參數處理
 */

export function getAuthHeader(): string {
  const token = Buffer.from(
    `${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`
  ).toString("base64");
  return `Basic ${token}`;
}

export const baseUrl = process.env.LANGFUSE_HOST ?? "https://cloud.langfuse.com";

/** Helper: call Langfuse REST API */
export async function langfuseApi(
  path: string,
  opts?: { method?: string; body?: unknown; params?: Record<string, string | string[] | undefined> }
): Promise<unknown> {
  const url = new URL(`/api/public${path}`, baseUrl);
  if (opts?.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v) {
        if (Array.isArray(v)) {
          v.forEach((item) => url.searchParams.append(k, item));
        } else {
          url.searchParams.set(k, v);
        }
      }
    }
  }
  const res = await fetch(url.toString(), {
    method: opts?.method ?? "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Langfuse API ${res.status}: ${text}`);
  }
  return res.json();
}
