/**
 * Instance Management Tools
 *
 * 實例管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerInstanceTools(server: McpServer): void {
  // List instances
  server.tool(
    "listInstances",
    "List all Langfuse instances with pagination and filters.",
    {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      status: z
        .enum(["active", "inactive", "suspended", "archived"])
        .optional(),
    },
    async (input) => {
      const result = await langfuseApi("/api/admin/instances", {
        authType: "admin-bearer",
        rawPath: true,
        params: {
          page: input.page?.toString(),
          limit: input.limit?.toString(),
          status: input.status,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get instance
  server.tool(
    "getInstance",
    "Get details of a specific Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}`,
        {
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Create instance
  server.tool(
    "createInstance",
    "Create a new Langfuse instance.",
    {
      name: z.string(),
      description: z.string().optional(),
      region: z.string().optional(),
      maxUsers: z.number().int().optional(),
      maxRequests: z.number().int().optional(),
    },
    async (input) => {
      const result = await langfuseApi("/api/admin/instances", {
        method: "POST",
        authType: "admin-bearer",
        rawPath: true,
        body: {
          name: input.name,
          description: input.description,
          region: input.region,
          maxUsers: input.maxUsers,
          maxRequests: input.maxRequests,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Update instance
  server.tool(
    "updateInstance",
    "Update an existing Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
      name: z.string().optional(),
      description: z.string().optional(),
      maxUsers: z.number().int().optional(),
      maxRequests: z.number().int().optional(),
    },
    async (input) => {
      if (!input.name && input.description === undefined && input.maxUsers === undefined && input.maxRequests === undefined) {
        throw new Error("At least one field (name, description, maxUsers, or maxRequests) must be provided");
      }
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}`,
        {
          method: "PATCH",
          authType: "admin-bearer",
          rawPath: true,
          body: {
            name: input.name,
            description: input.description,
            maxUsers: input.maxUsers,
            maxRequests: input.maxRequests,
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Delete instance
  server.tool(
    "deleteInstance",
    "Delete a Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}`,
        {
          method: "DELETE",
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // List instance events
  server.tool(
    "listInstanceEvents",
    "List events for a Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
      eventType: z.string().optional(),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}/events`,
        {
          authType: "admin-bearer",
          rawPath: true,
          params: {
            eventType: input.eventType,
            page: input.page?.toString(),
            limit: input.limit?.toString(),
          },
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get instance status
  server.tool(
    "getInstanceStatus",
    "Get health and status information for a Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}/status`,
        {
          authType: "admin-bearer",
          rawPath: true,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Configure instance settings
  server.tool(
    "configureInstanceSettings",
    "Configure advanced settings for a Langfuse instance.",
    {
      instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid instance ID format"),
      settings: z.record(z.unknown()),
    },
    async (input) => {
      const result = await langfuseApi(
        `/api/admin/instances/${input.instanceId}/settings`,
        {
          method: "PUT",
          authType: "admin-bearer",
          rawPath: true,
          body: input.settings,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
