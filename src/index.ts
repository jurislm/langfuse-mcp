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

// Import tool registration functions
import { registerPromptTools } from "./tools/prompts.js";
import { registerTraceTools } from "./tools/traces.js";
import { registerObservationTools } from "./tools/observations.js";
import { registerScoreTools } from "./tools/scores.js";
import { registerSessionTools } from "./tools/sessions.js";
import { registerDatasetTools } from "./tools/datasets.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerScoreConfigTools } from "./tools/score-configs.js";

// --- MCP Server ---

const server = new McpServer({
  name: "jurislm-langfuse",
  version: "1.0.0",
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

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
