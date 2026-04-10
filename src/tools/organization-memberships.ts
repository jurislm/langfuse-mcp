/**
 * Organization Memberships Tools
 *
 * 組織與專案成員管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerOrganizationMembershipsTools(server: McpServer): void {
  // List organization members
  server.tool(
    "listOrganizationMembers",
    "List all members of an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/members`,
        {
          authType: "admin-bearer",
          rawPath: true,
          params: {
            page: input.page?.toString(),
            limit: input.limit?.toString(),
            role: input.role,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Add organization member
  server.tool(
    "addOrganizationMember",
    "Add a new member to an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      email: z.string().email(),
      role: z.enum(["owner", "admin", "member", "viewer"]),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/members`,
        {
          method: "POST",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            email: input.email,
            role: input.role,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Update organization member
  server.tool(
    "updateOrganizationMember",
    "Update an organization member's role or permissions.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      memberId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid member ID format"),
      role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
    },
    async (input) => {
      if (input.role === undefined) {
        throw new Error("At least one field (role) must be provided");
      }
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/members/${input.memberId}`,
        {
          method: "PATCH",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            role: input.role,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Remove organization member
  server.tool(
    "removeOrganizationMember",
    "Remove a member from an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      memberId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid member ID format"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/members/${input.memberId}`,
        {
          method: "DELETE",
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // List project members
  server.tool(
    "listProjectMembers",
    "List all members with access to a specific project within an organization.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      projectId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid project ID format"),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects/${input.projectId}/members`,
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

  // Update project member
  server.tool(
    "updateProjectMember",
    "Update a member's access level for a specific project.",
    {
      orgId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization ID format"),
      projectId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid project ID format"),
      memberId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid member ID format"),
      role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
    },
    async (input) => {
      if (input.role === undefined) {
        throw new Error("At least one field (role) must be provided");
      }
      const result = await langfuseApi(
        `/api/admin/organizations/${input.orgId}/projects/${input.projectId}/members/${input.memberId}`,
        {
          method: "PATCH",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            role: input.role,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
