/**
 * Dataset Management Tools
 *
 * 資料集管理（JurisLM 擴充）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { langfuseApi } from "../lib/api.js";

export function registerDatasetTools(server: McpServer): void {
  server.tool(
    "listDatasets",
    "List datasets with pagination. Datasets are used for evals and benchmarking.",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
      query: z.string().optional().describe("Search query for dataset name or description"),
    },
    async (params) => {
      const result = await langfuseApi("/datasets", {
        params: {
          page: String(params.page),
          limit: String(params.limit),
          ...(params.query && { query: params.query }),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getDataset",
    "Get a dataset by ID with metadata and item counts.",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
    },
    async (params) => {
      const result = await langfuseApi(`/datasets/${encodeURIComponent(params.datasetId)}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "createDataset",
    "Create a new dataset for evals or benchmarking.",
    {
      name: z.string().min(1).max(255).describe("Dataset name"),
      description: z.string().max(2000).optional().describe("Dataset description"),
    },
    async (params) => {
      const result = await langfuseApi("/datasets", {
        method: "POST",
        body: params,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "listDatasetItems",
    "List items in a dataset with pagination.",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    },
    async (params) => {
      const result = await langfuseApi(`/datasets/${encodeURIComponent(params.datasetId)}/items`, {
        params: {
          page: String(params.page),
          limit: String(params.limit),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "createDatasetItem",
    "Add an item to a dataset (input/output pair for evals).",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
      input: z.record(z.unknown()).describe("Input data (JSON)"),
      expectedOutput: z.record(z.unknown()).optional().describe("Expected output (JSON)"),
      metadata: z.record(z.unknown()).optional().describe("Metadata (JSON)"),
    },
    async (params) => {
      const { datasetId, ...body } = params;
      const result = await langfuseApi(`/datasets/${encodeURIComponent(datasetId)}/items`, {
        method: "POST",
        body,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getDatasetItem",
    "Get a single dataset item by ID.",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
      datasetItemId: z.string().min(1).describe("Dataset item ID"),
    },
    async (params) => {
      const result = await langfuseApi(
        `/datasets/${encodeURIComponent(params.datasetId)}/items/${encodeURIComponent(params.datasetItemId)}`
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "listDatasetRuns",
    "List eval runs for a dataset (traces that used this dataset).",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
      page: z.number().int().min(1).default(1).describe("Page number"),
      limit: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    },
    async (params) => {
      const result = await langfuseApi(`/datasets/${encodeURIComponent(params.datasetId)}/runs`, {
        params: {
          page: String(params.page),
          limit: String(params.limit),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "getDatasetRun",
    "Get details of a dataset run (eval execution).",
    {
      datasetId: z.string().min(1).describe("Dataset ID"),
      datasetRunId: z.string().min(1).describe("Dataset run ID"),
    },
    async (params) => {
      const result = await langfuseApi(
        `/datasets/${encodeURIComponent(params.datasetId)}/runs/${encodeURIComponent(params.datasetRunId)}`
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
