import { describe, it, expect, beforeEach } from "bun:test";
import { langfuseApi } from "./api.js";

describe("langfuseApi", () => {
  beforeEach(() => {
    // Reset environment for each test
    process.env.LANGFUSE_PUBLIC_KEY = "pk-test-key";
    process.env.LANGFUSE_SECRET_KEY = "sk-test-key";
  });

  describe("environment validation", () => {
    it("should throw error when LANGFUSE_PUBLIC_KEY is missing", async () => {
      delete process.env.LANGFUSE_PUBLIC_KEY;

      try {
        await langfuseApi("/test");
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("LANGFUSE_PUBLIC_KEY");
      }
    });

    it("should throw error when LANGFUSE_SECRET_KEY is missing", async () => {
      delete process.env.LANGFUSE_SECRET_KEY;

      try {
        await langfuseApi("/test");
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("LANGFUSE_SECRET_KEY");
      }
    });
  });

  describe("timeout handling", () => {
    it("should throw timeout error when request exceeds timeout", async () => {
      const mockFetcher = async (url: string, init?: RequestInit): Promise<Response> => {
        const signal = init?.signal;
        if (!signal) {
          throw new Error("Expected signal in RequestInit");
        }

        // Simulate abort signal being triggered
        return new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      };

      try {
        await langfuseApi("/test", {
          timeout: 100,
          fetcher: mockFetcher,
        });
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("timed out after 100ms");
      }
    });
  });

  describe("content type validation", () => {
    it("should throw error when response Content-Type is not JSON", async () => {
      const mockFetcher = async (): Promise<Response> => {
        return new Response("plain text", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      };

      try {
        await langfuseApi("/test", {
          fetcher: mockFetcher,
        });
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("unexpected Content-Type");
        expect(error.message).toContain("text/plain");
      }
    });

    it("should throw error when response Content-Type is missing", async () => {
      const mockFetcher = async (): Promise<Response> => {
        return new Response("body", {
          status: 200,
          headers: {},
        });
      };

      try {
        await langfuseApi("/test", {
          fetcher: mockFetcher,
        });
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("unexpected Content-Type");
        expect(error.message).toContain("missing");
      }
    });

    it("should accept JSON response with charset", async () => {
      const mockResponse = { success: true };
      const mockFetcher = async (): Promise<Response> => {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      };

      const result = await langfuseApi("/test", {
        fetcher: mockFetcher,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("204 no content handling", () => {
    it("should return null for 204 response", async () => {
      const mockFetcher = async (): Promise<Response> => {
        return new Response(null, {
          status: 204,
          headers: {},
        });
      };

      const result = await langfuseApi("/test", {
        method: "DELETE",
        fetcher: mockFetcher,
      });

      expect(result).toBeNull();
    });
  });

  describe("successful requests", () => {
    it("should parse and return JSON response", async () => {
      const mockResponse = { id: "123", name: "test" };
      const mockFetcher = async (): Promise<Response> => {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const result = await langfuseApi("/test", {
        fetcher: mockFetcher,
      });

      expect(result).toEqual(mockResponse);
    });

    it("should include authorization header", async () => {
      let capturedHeaders: Headers | undefined;

      const mockFetcher = async (_url: string, init?: RequestInit): Promise<Response> => {
        if (init?.headers instanceof Headers) {
          capturedHeaders = init.headers;
        } else if (init?.headers && typeof init.headers === "object") {
          capturedHeaders = new Headers(init.headers as Record<string, string>);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      await langfuseApi("/test", {
        fetcher: mockFetcher,
      });

      expect(capturedHeaders?.get("Authorization")).toBeDefined();
      expect(capturedHeaders?.get("Authorization")).toMatch(/^Basic /);
    });
  });

  describe("error handling", () => {
    it("should throw error for non-ok response", async () => {
      const mockFetcher = async (): Promise<Response> => {
        return new Response("Not Found", {
          status: 404,
        });
      };

      try {
        await langfuseApi("/test", {
          fetcher: mockFetcher,
        });
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("404");
        expect(error.message).toContain("Not Found");
      }
    });

    it("should handle fetcher errors", async () => {
      const mockFetcher = async (): Promise<Response> => {
        throw new Error("Network error");
      };

      try {
        await langfuseApi("/test", {
          fetcher: mockFetcher,
        });
        expect.unreachable();
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("Network error");
      }
    });
  });
});
