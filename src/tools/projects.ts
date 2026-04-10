/**
 * Project Query Tools
 *
 * 專案查詢（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { langfuseApi } from "../lib/api.js";

export function registerProjectTools(server: McpServer): void {
  server.tool(
    "getProject",
    "Get current project details (name, API keys, limits, usage).",
    {},
    async () => {
      const result = await langfuseApi("/projects");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
