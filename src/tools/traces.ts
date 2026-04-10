/**
 * Trace Query Tools
 *
 * 執行追蹤查詢（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerTraceTools(server: McpServer): void {
  server.tool(
    "listTraces",
    "List traces with optional filters. Returns trace metadata, scores, and pagination.",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(20).describe("Items per page"),
      name: z.string().optional().describe("Filter by trace name"),
      userId: z.string().optional().describe("Filter by user ID"),
      tags: z.array(z.string()).optional().describe("Filter by tags"),
      fromTimestamp: z.string().datetime({ offset: true }).optional().describe("From timestamp (ISO 8601)"),
      toTimestamp: z.string().datetime({ offset: true }).optional().describe("To timestamp (ISO 8601)"),
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
}
