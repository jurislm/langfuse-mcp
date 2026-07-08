#!/usr/bin/env node
/**
 * @jurislm/langfuse-mcp
 *
 * JurisLM 專用 Langfuse MCP Server（stdio transport）
 *
 * 功能：
 * 1. Prompt Management（複製官方 MCP 的 6 個 tools）
 * 2. Trace/Observation 查詢（官方 MCP 尚不支援，JurisLM 自行擴充）
 *
 * 環境變數（優先順序：.env.langfuse > Plugin ${VAR} > ~/.zshenv）：
 *   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST
 */

// Load per-project credentials from .env.langfuse (gitignored, no new deps)
import { existsSync, readFileSync } from "fs";
import { join } from "path";
const _envFile = join(process.cwd(), ".env.langfuse");
if (existsSync(_envFile)) {
  for (const line of readFileSync(_envFile, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registration functions
import { registerPromptTools } from "./tools/prompts.js";
import { registerTraceTools } from "./tools/traces.js";
import { registerObservationTools } from "./tools/observations.js";
import { registerScoreTools } from "./tools/scores.js";
import { registerSessionTools } from "./tools/sessions.js";
import { registerDatasetTools } from "./tools/datasets.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerScoreConfigTools } from "./tools/score-configs.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerInstanceTools } from "./tools/instance-management.js";
import { registerOrganizationProjectsTools } from "./tools/organization-projects.js";
import { registerOrganizationApiKeysTools } from "./tools/organization-apikeys.js";
import { registerOrganizationMembershipsTools } from "./tools/organization-memberships.js";

// --- MCP Server ---

const server = new McpServer({
  name: "jurislm-langfuse",
  version: "1.1.0",
});

// Register all tools
registerPromptTools(server);
registerTraceTools(server);
registerObservationTools(server);
registerScoreTools(server);
registerSessionTools(server);
registerDatasetTools(server);
registerMetricsTools(server);
registerScoreConfigTools(server);
registerProjectTools(server);
registerInstanceTools(server);
registerOrganizationProjectsTools(server);
registerOrganizationApiKeysTools(server);
registerOrganizationMembershipsTools(server);

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
