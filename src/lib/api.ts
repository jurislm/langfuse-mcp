/**
 * Langfuse API 客戶端
 *
 * 提供 REST API 呼叫助手，支援 Basic Auth、Admin API、Instance/Organization APIs
 */

export function getBasicAuthHeader(): string {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error("LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be configured");
  }

  const token = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
  return `Basic ${token}`;
}

export function getAdminAuthHeader(): string {
  const adminKey = process.env.LANGFUSE_ADMIN_API_KEY;
  if (!adminKey) {
    throw new Error("LANGFUSE_ADMIN_API_KEY not configured");
  }
  return `Bearer ${adminKey}`;
}

export function getOrgAuthHeader(): string {
  const orgKey = process.env.LANGFUSE_ORG_API_KEY;
  if (!orgKey) {
    throw new Error("LANGFUSE_ORG_API_KEY not configured");
  }
  return `Bearer ${orgKey}`;
}

export const baseUrl = process.env.LANGFUSE_HOST ?? "https://cloud.langfuse.com";

type AuthType = "basic" | "admin-bearer" | "org-bearer";

const DEFAULT_TIMEOUT_MS = 30_000;

/** Type-safe fetch function signature for dependency injection */
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** Helper: get authorization header based on auth type */
function getAuthHeader(authType: AuthType = "basic"): string {
  switch (authType) {
    case "basic":
      return getBasicAuthHeader();
    case "admin-bearer":
      return getAdminAuthHeader();
    case "org-bearer":
      return getOrgAuthHeader();
  }
}

/** Helper: call Langfuse REST API */
export async function langfuseApi(
  path: string,
  opts?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | string[] | undefined>;
    authType?: AuthType;
    rawPath?: boolean;
    timeout?: number;
    fetcher?: Fetcher;
  }
): Promise<unknown> {
  const authType = opts?.authType ?? "basic";
  const rawPath = opts?.rawPath ?? false;
  const timeout = opts?.timeout ?? DEFAULT_TIMEOUT_MS;
  const fetcher = opts?.fetcher ?? fetch;
  const pathPrefix = rawPath ? "" : "/api/public";
  const url = new URL(`${pathPrefix}${path}`, baseUrl);

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetcher(url.toString(), {
      method: opts?.method ?? "GET",
      headers: {
        Authorization: getAuthHeader(authType),
        "Content-Type": "application/json",
      },
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Langfuse API ${res.status}: ${text}`);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return null;
    }

    // Validate Content-Type before parsing JSON
    const contentType = res.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Langfuse API returned unexpected Content-Type: ${contentType ?? "missing"}. Response: ${text}`
      );
    }

    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Langfuse API request timed out after ${timeout}ms`, {
        cause: err,
      });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
