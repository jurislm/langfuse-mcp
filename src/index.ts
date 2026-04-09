#!/usr/bin/env bun
/**
 * @jurislm/langfuse-mcp
 *
 * JurisLM 專用 Langfuse MCP Server（stdio transport）
 *
 * 功能：
 * 1. Prompt Management（複製官方 MCP 的 6 個 tools）
 * 2. Trace/Observation 查詢（官方 MCP 尚不支援，JurisLM 自行擴充）
 *
 * 環境變數：
 *   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/** Basic auth header for REST API calls */
function getAuthHeader(): string {
  const token = Buffer.from(
    `${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`
  ).toString("base64");
  return `Basic ${token}`;
}

const baseUrl = process.env.LANGFUSE_HOST ?? "https://cloud.langfuse.com";

/** Helper: call Langfuse REST API */
async function langfuseApi(
  path: string,
  opts?: { method?: string; body?: unknown; params?: Record<string, string> }
): Promise<unknown> {
  const url = new URL(`/api/public${path}`, baseUrl);
  if (opts?.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v) url.searchParams.set(k, v);
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

// --- MCP Server ---

const server = new McpServer({
  name: "jurislm-langfuse",
  version: "0.1.0",
});

// ============================================
// 1. Prompt Management Tools（複製官方 MCP）
// ============================================

server.tool(
  "listPrompts",
  "List and filter prompts. Returns metadata including versions, labels, tags, last updated timestamp, and prompt type.",
  {
    page: z.number().int().min(1).default(1).describe("Page number (default: 1)"),
    limit: z.number().int().min(1).max(100).default(50).describe("Items per page (1-100, default: 50)"),
    name: z.string().max(255).optional().describe("Filter by exact prompt name"),
    label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Filter by label"),
    tag: z.string().optional().describe("Filter by tag"),
  },
  async (params) => {
    const result = await langfuseApi("/v2/prompts", {
      params: {
        page: String(params.page),
        limit: String(params.limit),
        ...(params.name && { name: params.name }),
        ...(params.label && { label: params.label }),
        ...(params.tag && { tag: params.tag }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "getPrompt",
  "Fetch a prompt by name with optional label or version. Returns full content with resolved dependencies.",
  {
    name: z.string().min(1).max(255).describe("Prompt name"),
    label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Label (default: production)"),
    version: z.number().int().positive().optional().describe("Specific version number"),
  },
  async (params) => {
    const result = await langfuseApi(`/v2/prompts/${encodeURIComponent(params.name)}`, {
      params: {
        ...(params.label && { label: params.label }),
        ...(params.version && { version: String(params.version) }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "createTextPrompt",
  "Create a new text prompt version. Prompts are immutable — use updatePromptLabels to promote. Supports {{variable}} syntax.",
  {
    name: z.string().min(1).max(255).describe("Prompt name"),
    prompt: z.string().describe("Prompt text content (supports {{variables}})"),
    labels: z.array(z.string()).optional().describe("Labels (e.g., ['production'])"),
    config: z.record(z.unknown()).optional().describe("JSON config (e.g., {model, temperature})"),
    tags: z.array(z.string()).optional().describe("Tags for organization"),
    commitMessage: z.string().optional().describe("Commit message"),
  },
  async (params) => {
    const result = await langfuseApi("/v2/prompts", {
      method: "POST",
      body: { ...params, type: "text" },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "createChatPrompt",
  "Create a new chat prompt version. Chat prompts are arrays of messages with roles (system/user/assistant).",
  {
    name: z.string().min(1).max(255).describe("Prompt name"),
    prompt: z.array(z.object({
      role: z.string().describe("Role (system/user/assistant)"),
      content: z.string().describe("Message content"),
    })).min(1).describe("Array of chat messages"),
    labels: z.array(z.string()).optional().describe("Labels"),
    config: z.record(z.unknown()).optional().describe("JSON config"),
    tags: z.array(z.string()).optional().describe("Tags"),
    commitMessage: z.string().optional().describe("Commit message"),
  },
  async (params) => {
    const result = await langfuseApi("/v2/prompts", {
      method: "POST",
      body: { ...params, type: "chat" },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "getPromptUnresolved",
  "Fetch a prompt WITHOUT resolving dependencies. Useful for debugging prompt composition/stacking.",
  {
    name: z.string().min(1).max(255).describe("Prompt name"),
    label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Label"),
    version: z.number().int().positive().optional().describe("Version number"),
  },
  async (params) => {
    const result = await langfuseApi(`/v2/prompts/${encodeURIComponent(params.name)}`, {
      params: {
        ...(params.label && { label: params.label }),
        ...(params.version && { version: String(params.version) }),
        resolve: "false",
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "updatePromptLabels",
  "Update labels for a specific prompt version. Labels are unique across versions — setting on one removes from others.",
  {
    name: z.string().min(1).max(255).describe("Prompt name"),
    version: z.number().int().positive().describe("Version number to update"),
    newLabels: z.array(z.string()).describe("New labels (can be empty to remove all)"),
  },
  async (params) => {
    const result = await langfuseApi(
      `/v2/prompts/${encodeURIComponent(params.name)}/versions/${params.version}/labels`,
      { method: "PUT", body: { labels: params.newLabels } }
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================
// 2. Trace 查詢（JurisLM 擴充）
// ============================================

server.tool(
  "listTraces",
  "List traces with optional filters. Returns trace metadata, scores, and pagination.",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    limit: z.number().int().min(1).max(100).default(20).describe("Items per page"),
    name: z.string().optional().describe("Filter by trace name"),
    userId: z.string().optional().describe("Filter by user ID"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    fromTimestamp: z.string().optional().describe("From timestamp (ISO 8601)"),
    toTimestamp: z.string().optional().describe("To timestamp (ISO 8601)"),
  },
  async (params) => {
    const result = await langfuseApi("/traces", {
      params: {
        page: String(params.page),
        limit: String(params.limit),
        ...(params.name && { name: params.name }),
        ...(params.userId && { userId: params.userId }),
        ...(params.fromTimestamp && { fromTimestamp: params.fromTimestamp }),
        ...(params.toTimestamp && { toTimestamp: params.toTimestamp }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "getTrace",
  "Get a single trace by ID with full details including observations and scores.",
  {
    traceId: z.string().min(1).describe("Trace ID"),
  },
  async (params) => {
    const result = await langfuseApi(`/traces/${encodeURIComponent(params.traceId)}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================
// 3. Observation 查詢（JurisLM 擴充）
// ============================================

server.tool(
  "listObservations",
  "List observations (generations, spans, events) with filters. High-performance endpoint with selective field retrieval.",
  {
    traceId: z.string().optional().describe("Filter by trace ID"),
    type: z.enum(["GENERATION", "SPAN", "EVENT"]).optional().describe("Filter by type"),
    name: z.string().optional().describe("Filter by observation name"),
    limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    page: z.number().int().min(1).default(1).describe("Page number"),
  },
  async (params) => {
    const result = await langfuseApi("/observations", {
      params: {
        page: String(params.page),
        limit: String(params.limit),
        ...(params.traceId && { traceId: params.traceId }),
        ...(params.type && { type: params.type }),
        ...(params.name && { name: params.name }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "getObservation",
  "Get a single observation by ID with full details (input, output, usage, model, duration).",
  {
    observationId: z.string().min(1).describe("Observation ID"),
  },
  async (params) => {
    const result = await langfuseApi(`/observations/${encodeURIComponent(params.observationId)}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================
// 4. Score 管理（JurisLM 擴充）
// ============================================

server.tool(
  "createScore",
  "Create a score for a trace or observation. Use for eval results, user feedback, or quality metrics.",
  {
    traceId: z.string().min(1).describe("Trace ID to score"),
    name: z.string().min(1).describe("Score name (e.g., 'accuracy', 'hallucination')"),
    value: z.number().describe("Score value (numeric)"),
    observationId: z.string().optional().describe("Optional: score a specific observation"),
    comment: z.string().optional().describe("Optional comment"),
  },
  async (params) => {
    const result = await langfuseApi("/scores", {
      method: "POST",
      body: params,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "listScores",
  "List scores with optional filters by trace, name, or time range.",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    name: z.string().optional().describe("Filter by score name"),
    userId: z.string().optional().describe("Filter by user ID"),
    traceId: z.string().optional().describe("Filter by trace ID"),
  },
  async (params) => {
    const result = await langfuseApi("/scores", {
      params: {
        page: String(params.page),
        limit: String(params.limit),
        ...(params.name && { name: params.name }),
        ...(params.userId && { userId: params.userId }),
        ...(params.traceId && { traceId: params.traceId }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================
// 5. Session 查詢（JurisLM 擴充）
// ============================================

server.tool(
  "listSessions",
  "List sessions with pagination. Sessions group related traces together.",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    limit: z.number().int().min(1).max(100).default(20).describe("Items per page"),
    fromTimestamp: z.string().optional().describe("From timestamp (ISO 8601)"),
    toTimestamp: z.string().optional().describe("To timestamp (ISO 8601)"),
  },
  async (params) => {
    const result = await langfuseApi("/sessions", {
      params: {
        page: String(params.page),
        limit: String(params.limit),
        ...(params.fromTimestamp && { fromTimestamp: params.fromTimestamp }),
        ...(params.toTimestamp && { toTimestamp: params.toTimestamp }),
      },
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
