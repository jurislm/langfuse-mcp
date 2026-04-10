/**
 * Session Query Tools
 *
 * 會話查詢（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerSessionTools(server: McpServer): void {
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
}
