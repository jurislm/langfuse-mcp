/**
 * Prompt Management Tools
 *
 * 複製官方 Langfuse MCP 的 prompt API，超高階版本控制
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerPromptTools(server: McpServer): void {
  server.tool(
    "listPrompts",
    "List and filter prompts. Returns metadata including versions, labels, tags, last updated timestamp, and prompt type.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (default: 1)"),
      limit: z.number().int().min(1).max(100).default(50).describe("Items per page (1-100, default: 50)"),
      name: z.string().max(255).optional().describe("Filter by exact prompt name"),
      label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Filter by label"),
      tag: z.string().optional().describe("Filter by tag"),
    },
    async (params) => {
      const result = await langfuseApi("/v2/prompts", {
        params: {
          page: String(params.page),
          limit: String(params.limit),
          ...(params.name && { name: params.name }),
          ...(params.label && { label: params.label }),
          ...(params.tag && { tag: params.tag }),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getPrompt",
    "Fetch a prompt by name with optional label or version. Returns full content with resolved dependencies.",
    {
      name: z.string().min(1).max(255).describe("Prompt name"),
      label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Label (default: production)"),
      version: z.number().int().positive().optional().describe("Specific version number"),
    },
    async (params) => {
      const result = await langfuseApi(`/v2/prompts/${encodeURIComponent(params.name)}`, {
        params: {
          ...(params.label && { label: params.label }),
          ...(params.version && { version: String(params.version) }),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "createTextPrompt",
    "Create a new text prompt version. Prompts are immutable — use updatePromptLabels to promote. Supports {{variable}} syntax.",
    {
      name: z.string().min(1).max(255).describe("Prompt name"),
      prompt: z.string().describe("Prompt text content (supports {{variables}})"),
      labels: z.array(z.string()).optional().describe("Labels (e.g., ['production'])"),
      config: z.record(z.unknown()).optional().describe("JSON config (e.g., {model, temperature})"),
      tags: z.array(z.string()).optional().describe("Tags for organization"),
      commitMessage: z.string().optional().describe("Commit message"),
    },
    async (params) => {
      const result = await langfuseApi("/v2/prompts", {
        method: "POST",
        body: { ...params, type: "text" },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "createChatPrompt",
    "Create a new chat prompt version. Chat prompts are arrays of messages with roles (system/user/assistant).",
    {
      name: z.string().min(1).max(255).describe("Prompt name"),
      prompt: z.array(z.object({
        role: z.string().describe("Role (system/user/assistant)"),
        content: z.string().describe("Message content"),
      })).min(1).describe("Array of chat messages"),
      labels: z.array(z.string()).optional().describe("Labels"),
      config: z.record(z.unknown()).optional().describe("JSON config"),
      tags: z.array(z.string()).optional().describe("Tags"),
      commitMessage: z.string().optional().describe("Commit message"),
    },
    async (params) => {
      const result = await langfuseApi("/v2/prompts", {
        method: "POST",
        body: { ...params, type: "chat" },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getPromptUnresolved",
    "Fetch a prompt WITHOUT resolving dependencies. Useful for debugging prompt composition/stacking.",
    {
      name: z.string().min(1).max(255).describe("Prompt name"),
      label: z.string().max(36).regex(/^[a-z0-9_\-.]+$/).optional().describe("Label"),
      version: z.number().int().positive().optional().describe("Version number"),
    },
    async (params) => {
      const result = await langfuseApi(`/v2/prompts/${encodeURIComponent(params.name)}`, {
        params: {
          ...(params.label && { label: params.label }),
          ...(params.version && { version: String(params.version) }),
          resolve: "false",
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "updatePromptLabels",
    "Update labels for a specific prompt version. Labels are unique across versions — setting on one removes from others.",
    {
      name: z.string().min(1).max(255).describe("Prompt name"),
      version: z.number().int().positive().describe("Version number to update"),
      newLabels: z.array(z.string()).describe("New labels (can be empty to remove all)"),
    },
    async (params) => {
      const result = await langfuseApi(
        `/v2/prompts/${encodeURIComponent(params.name)}/versions/${params.version}/labels`,
        { method: "PUT", body: { labels: params.newLabels } }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
