/**
 * Score Configuration Tools
 *
 * 評分配置管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerScoreConfigTools(server: McpServer): void {
  server.tool(
    "listScoreConfigs",
    "List all score configurations (names and data types for custom scores).",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    },
    async (params) => {
      const result = await langfuseApi("/score-configs", {
        params: {
          page: String(params.page),
          limit: String(params.limit),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getScoreConfig",
    "Get details of a score configuration including name, data type, and categories.",
    {
      scoreConfigId: z.string().min(1).describe("Score config ID"),
    },
    async (params) => {
      const result = await langfuseApi(`/score-configs/${encodeURIComponent(params.scoreConfigId)}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "createScoreConfig",
    "Create a new score configuration for custom scoring metrics.",
    {
      name: z.string().min(1).max(255).describe("Score name (e.g., 'helpfulness', 'accuracy')"),
      dataType: z.enum(["numeric", "categorical"]).describe("Data type for score values"),
      categories: z.array(z.string()).optional().describe("Categories (for categorical data type)"),
      description: z.string().max(500).optional().describe("Description"),
    },
    async (params) => {
      const result = await langfuseApi("/score-configs", {
        method: "POST",
        body: params,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "updateScoreConfig",
    "Update an existing score configuration.",
    {
      scoreConfigId: z.string().min(1).describe("Score config ID"),
      name: z.string().min(1).max(255).optional().describe("New score name"),
      categories: z.array(z.string()).optional().describe("New categories (for categorical type)"),
      description: z.string().max(500).optional().describe("New description"),
    },
    async (params) => {
      const { scoreConfigId, ...body } = params;
      const result = await langfuseApi(`/score-configs/${encodeURIComponent(scoreConfigId)}`, {
        method: "PATCH",
        body,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
