/**
 * Organization API Keys Tools
 *
 * 組織 API 密鑰管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerOrganizationApiKeysTools(server: McpServer): void {
  // List organization API keys
  server.tool(
    "listOrganizationApiKeys",
    "List all API keys for an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/api-keys`,
        {
          authType: "admin-bearer",
          rawPath: true,
          params: {
            page: input.page?.toString(),
            limit: input.limit?.toString(),
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Create organization API key
  server.tool(
    "createOrganizationApiKey",
    "Create a new API key for an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      name: z.string(),
      permissions: z.array(z.string()).optional(),
      expiresAt: z.string().datetime({ offset: true }).optional().describe("Expiration date (ISO 8601)"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/api-keys`,
        {
          method: "POST",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            name: input.name,
            permissions: input.permissions,
            expiresAt: input.expiresAt,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Delete organization API key
  server.tool(
    "deleteOrganizationApiKey",
    "Delete an API key from an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      keyId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid key ID format"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/api-keys/${input.keyId}`,
        {
          method: "DELETE",
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
