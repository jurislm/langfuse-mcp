import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSessionTools } from "./sessions.js";

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

describe("registerSessionTools", () => {
  const mockFetchSessions = mock(async () => ({
    data: [{ id: "session-1", createdAt: "2024-01-01T00:00:00Z" }],
    meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
  }));

  const mockClient = {
    fetchSessions: mockFetchSessions,
  };

  beforeEach(() => {
    mockFetchSessions.mockClear();
  });

  it("should register listSessions tool", () => {
    const { server, handlers } = makeMockServer();
    registerSessionTools(server, mockClient as never);
    expect(Object.keys(handlers)).toContain("listSessions");
  });

  describe("error handling", () => {
    it("should return isError response when SDK throws", async () => {
      const errorClient = {
        fetchSessions: mock(async () => { throw new Error("Network failure"); }),
      };
      const { server, handlers } = makeMockServer();
      registerSessionTools(server, errorClient as never);

      const result = await handlers["listSessions"]({ page: 1, limit: 20 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Network failure");
    });
  });

  describe("listSessions", () => {
    it("should call client.fetchSessions with correct params", async () => {
      const { server, handlers } = makeMockServer();
      registerSessionTools(server, mockClient as never);

      await handlers["listSessions"]({
        page: 2,
        limit: 10,
        fromTimestamp: "2024-01-01T00:00:00Z",
        toTimestamp: "2024-12-31T23:59:59Z",
      });

      expect(mockFetchSessions).toHaveBeenCalledTimes(1);
      const callArgs = (mockFetchSessions.mock.calls as unknown as Array<unknown[]>)[0][0] as Record<string, unknown>;
      expect(callArgs).toMatchObject({
        page: 2,
        limit: 10,
        fromTimestamp: new Date("2024-01-01T00:00:00Z"),
        toTimestamp: new Date("2024-12-31T23:59:59Z"),
      });
    });

    it("should return JSON-formatted result", async () => {
      const { server, handlers } = makeMockServer();
      registerSessionTools(server, mockClient as never);

      const result = await handlers["listSessions"]({ page: 1, limit: 20 });

      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data[0].id).toBe("session-1");
    });
  });
});
