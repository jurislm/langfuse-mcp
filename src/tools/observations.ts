import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getLangfuseClient } from "../lib/client.js";
import type { Langfuse } from "langfuse";

export function registerObservationTools(
  server: McpServer,
  client: Pick<Langfuse, "fetchObservations" | "fetchObservation"> = getLangfuseClient()
): void {
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
      const result = await client.fetchObservations({
        page: params.page,
        limit: params.limit,
        ...(params.traceId && { traceId: params.traceId }),
        ...(params.type && { type: params.type }),
        ...(params.name && { name: params.name }),
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
      const result = await client.fetchObservation(params.observationId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
