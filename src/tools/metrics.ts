/**
 * Metrics Query Tools
 *
 * 度量查詢（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerMetricsTools(server: McpServer): void {
  server.tool(
    "getDailyMetrics",
    "Get daily metrics for traces and observations (latency, tokens, scores, cost).",
    {
      fromTimestamp: z.string().datetime({ offset: true }).describe("From timestamp (ISO 8601)"),
      toTimestamp: z.string().datetime({ offset: true }).describe("To timestamp (ISO 8601)"),
      name: z.string().optional().describe("Filter by trace/observation name"),
      userId: z.string().optional().describe("Filter by user ID"),
    },
    async (params) => {
      const result = await langfuseApi("/metrics/daily", {
        params: {
          fromTimestamp: params.fromTimestamp,
          toTimestamp: params.toTimestamp,
          ...(params.name && { name: params.name }),
          ...(params.userId && { userId: params.userId }),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getUsageSummary",
    "Get usage summary for a time period (total traces, observations, tokens, cost).",
    {
      fromTimestamp: z.string().datetime({ offset: true }).describe("From timestamp (ISO 8601)"),
      toTimestamp: z.string().datetime({ offset: true }).describe("To timestamp (ISO 8601)"),
    },
    async (params) => {
      const result = await langfuseApi("/metrics/summary", {
        params: {
          fromTimestamp: params.fromTimestamp,
          toTimestamp: params.toTimestamp,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
