import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTraceTools } from "./traces.js";

type ToolHandler = (params: Record<string, unknown>) => Promise<{ isError?: boolean; content: { type: string; text: string }[] }>;

function makeMockServer() {
  const handlers: Record<string, ToolHandler> = {};
  const server = {
    tool: (_name: string, _desc: string, _schema: unknown, handler: ToolHandler) => {
      handlers[_name] = handler;
    },
  } as unknown as McpServer;
  return { server, handlers };
}

describe("registerTraceTools", () => {
  const mockFetchTraces = mock(async () => ({
    data: [{ id: "trace-1", name: "test-trace" }],
    meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
  }));

  const mockFetchTrace = mock(async (_id: string) => ({
    data: { id: "trace-1", name: "test-trace", observations: [] },
  }));

  const mockClient = {
    fetchTraces: mockFetchTraces,
    fetchTrace: mockFetchTrace,
  };

  beforeEach(() => {
    mockFetchTraces.mockClear();
    mockFetchTrace.mockClear();
  });

  it("should register listTraces and getTrace tools", () => {
    const { server, handlers } = makeMockServer();
    registerTraceTools(server, mockClient as never);
    expect(Object.keys(handlers)).toContain("listTraces");
    expect(Object.keys(handlers)).toContain("getTrace");
  });

  describe("listTraces", () => {
    it("should call client.fetchTraces with correct params", async () => {
      const { server, handlers } = makeMockServer();
      registerTraceTools(server, mockClient as never);

      await handlers["listTraces"]({
        page: 2,
        limit: 10,
        name: "my-trace",
        userId: "user-123",
        tags: ["tag1", "tag2"],
        fromTimestamp: "2024-01-01T00:00:00Z",
        toTimestamp: "2024-12-31T23:59:59Z",
      });

      expect(mockFetchTraces).toHaveBeenCalledTimes(1);
      const callArgs = (mockFetchTraces.mock.calls as unknown as Array<unknown[]>)[0][0] as Record<string, unknown>;
      expect(callArgs).toMatchObject({
        page: 2,
        limit: 10,
        name: "my-trace",
        userId: "user-123",
        tags: ["tag1", "tag2"],
        fromTimestamp: new Date("2024-01-01T00:00:00Z"),
        toTimestamp: new Date("2024-12-31T23:59:59Z"),
      });
    });

    it("should return JSON-formatted result", async () => {
      const { server, handlers } = makeMockServer();
      registerTraceTools(server, mockClient as never);

      const result = await handlers["listTraces"]({ page: 1, limit: 20 });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data[0].id).toBe("trace-1");
    });
  });

  describe("error handling", () => {
    it("should return isError response when SDK throws", async () => {
      const errorClient = {
        fetchTraces: mock(async () => { throw new Error("Network failure"); }),
        fetchTrace: mock(async () => { throw new Error("Not found"); }),
      };
      const { server, handlers } = makeMockServer();
      registerTraceTools(server, errorClient as never);

      const result = await handlers["listTraces"]({ page: 1, limit: 20 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Network failure");
    });
  });

  describe("getTrace", () => {
    it("should call client.fetchTrace with the trace ID", async () => {
      const { server, handlers } = makeMockServer();
      registerTraceTools(server, mockClient as never);

      await handlers["getTrace"]({ traceId: "trace-abc" });

      expect(mockFetchTrace).toHaveBeenCalledTimes(1);
      expect(mockFetchTrace.mock.calls[0][0]).toBe("trace-abc");
    });

    it("should return JSON-formatted result", async () => {
      const { server, handlers } = makeMockServer();
      registerTraceTools(server, mockClient as never);

      const result = await handlers["getTrace"]({ traceId: "trace-1" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.id).toBe("trace-1");
    });
  });
});
