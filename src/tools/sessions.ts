import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getLangfuseClient } from "../lib/client.js";
import type { Langfuse } from "langfuse";

export function registerSessionTools(
  server: McpServer,
  client: Pick<Langfuse, "fetchSessions"> = getLangfuseClient()
): void {
  server.tool(
    "listSessions",
    "List sessions with pagination. Sessions group related traces together.",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(20).describe("Items per page"),
      fromTimestamp: z.string().datetime({ offset: true }).optional().describe("From timestamp (ISO 8601)"),
      toTimestamp: z.string().datetime({ offset: true }).optional().describe("To timestamp (ISO 8601)"),
    },
    async (params) => {
      const result = await client.fetchSessions({
        page: params.page,
        limit: params.limit,
        ...(params.fromTimestamp && { fromTimestamp: new Date(params.fromTimestamp) }),
        ...(params.toTimestamp && { toTimestamp: new Date(params.toTimestamp) }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
