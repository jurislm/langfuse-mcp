import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerObservationTools } from "./observations.js";

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

describe("registerObservationTools", () => {
  const mockFetchObservations = mock(async () => ({
    data: [{ id: "obs-1", type: "GENERATION", traceId: "trace-1" }],
    meta: { page: 1, limit: 50, totalItems: 1, totalPages: 1 },
  }));

  const mockFetchObservation = mock(async (_id: string) => ({
    data: { id: "obs-1", type: "GENERATION", input: "hello", output: "world" },
  }));

  const mockClient = {
    fetchObservations: mockFetchObservations,
    fetchObservation: mockFetchObservation,
  };

  beforeEach(() => {
    mockFetchObservations.mockClear();
    mockFetchObservation.mockClear();
  });

  it("should register listObservations and getObservation tools", () => {
    const { server, handlers } = makeMockServer();
    registerObservationTools(server, mockClient as never);
    expect(Object.keys(handlers)).toContain("listObservations");
    expect(Object.keys(handlers)).toContain("getObservation");
  });

  describe("listObservations", () => {
    it("should call client.fetchObservations with correct params", async () => {
      const { server, handlers } = makeMockServer();
      registerObservationTools(server, mockClient as never);

      await handlers["listObservations"]({
        page: 2,
        limit: 10,
        traceId: "trace-abc",
        type: "GENERATION",
        name: "my-obs",
      });

      expect(mockFetchObservations).toHaveBeenCalledTimes(1);
      const callArgs = (mockFetchObservations.mock.calls as unknown as Array<unknown[]>)[0][0] as Record<string, unknown>;
      expect(callArgs).toMatchObject({
        page: 2,
        limit: 10,
        traceId: "trace-abc",
        type: "GENERATION",
        name: "my-obs",
      });
    });

    it("should return JSON-formatted result", async () => {
      const { server, handlers } = makeMockServer();
      registerObservationTools(server, mockClient as never);

      const result = await handlers["listObservations"]({ page: 1, limit: 50 });

      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data[0].id).toBe("obs-1");
    });
  });

  describe("error handling", () => {
    it("should return isError response when SDK throws", async () => {
      const errorClient = {
        fetchObservations: mock(async () => { throw new Error("Network failure"); }),
        fetchObservation: mock(async () => { throw new Error("Not found"); }),
      };
      const { server, handlers } = makeMockServer();
      registerObservationTools(server, errorClient as never);

      const result = await handlers["listObservations"]({ page: 1, limit: 50 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Network failure");
    });
  });

  describe("getObservation", () => {
    it("should call client.fetchObservation with the observation ID", async () => {
      const { server, handlers } = makeMockServer();
      registerObservationTools(server, mockClient as never);

      await handlers["getObservation"]({ observationId: "obs-xyz" });

      expect(mockFetchObservation).toHaveBeenCalledTimes(1);
      expect(mockFetchObservation.mock.calls[0][0]).toBe("obs-xyz");
    });

    it("should return JSON-formatted result", async () => {
      const { server, handlers } = makeMockServer();
      registerObservationTools(server, mockClient as never);

      const result = await handlers["getObservation"]({ observationId: "obs-1" });

      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.id).toBe("obs-1");
    });
  });
});
