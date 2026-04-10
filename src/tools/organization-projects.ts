/**
 * Organization Projects Tools
 *
 * 組織專案管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerOrganizationProjectsTools(server: McpServer): void {
  // List organization projects
  server.tool(
    "listOrganizationProjects",
    "List all projects within an organization.",
    {
      orgId: z.string(),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects`,
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

  // Get organization project
  server.tool(
    "getOrganizationProject",
    "Get details of a specific project within an organization.",
    {
      orgId: z.string(),
      projectId: z.string(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects/${input.projectId}`,
        {
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Create organization project
  server.tool(
    "createOrganizationProject",
    "Create a new project within an organization.",
    {
      orgId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects`,
        {
          method: "POST",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            name: input.name,
            description: input.description,
            metadata: input.metadata,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Update organization project
  server.tool(
    "updateOrganizationProject",
    "Update an existing project within an organization.",
    {
      orgId: z.string(),
      projectId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects/${input.projectId}`,
        {
          method: "PATCH",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            name: input.name,
            description: input.description,
            metadata: input.metadata,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Delete organization project
  server.tool(
    "deleteOrganizationProject",
    "Delete a project from an organization.",
    {
      orgId: z.string(),
      projectId: z.string(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects/${input.projectId}`,
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
