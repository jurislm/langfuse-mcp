/**
 * Score Management Tools
 *
 * 評分管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerScoreTools(server: McpServer): void {
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
}
