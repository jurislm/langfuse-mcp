import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getLangfuseClient, resetLangfuseClient } from "./client.js";

describe("getLangfuseClient", () => {
  const originalPublicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const originalSecretKey = process.env.LANGFUSE_SECRET_KEY;
  const originalHost = process.env.LANGFUSE_HOST;

  beforeEach(() => {
    resetLangfuseClient();
    process.env.LANGFUSE_PUBLIC_KEY = "pk-test-key";
    process.env.LANGFUSE_SECRET_KEY = "sk-test-key";
  });

  afterEach(() => {
    resetLangfuseClient();
    if (originalPublicKey !== undefined) {
      process.env.LANGFUSE_PUBLIC_KEY = originalPublicKey;
    } else {
      delete process.env.LANGFUSE_PUBLIC_KEY;
    }
    if (originalSecretKey !== undefined) {
      process.env.LANGFUSE_SECRET_KEY = originalSecretKey;
    } else {
      delete process.env.LANGFUSE_SECRET_KEY;
    }
    if (originalHost !== undefined) {
      process.env.LANGFUSE_HOST = originalHost;
    } else {
      delete process.env.LANGFUSE_HOST;
    }
  });

  it("should throw when LANGFUSE_PUBLIC_KEY is missing", () => {
    delete process.env.LANGFUSE_PUBLIC_KEY;
    expect(() => getLangfuseClient()).toThrow("LANGFUSE_PUBLIC_KEY");
  });

  it("should throw when LANGFUSE_SECRET_KEY is missing", () => {
    delete process.env.LANGFUSE_SECRET_KEY;
    expect(() => getLangfuseClient()).toThrow("LANGFUSE_SECRET_KEY");
  });

  it("should return a Langfuse client instance", () => {
    const client = getLangfuseClient();
    expect(client).toBeDefined();
    expect(typeof client.fetchTraces).toBe("function");
  });

  it("should return the same instance on repeated calls (singleton)", () => {
    const first = getLangfuseClient();
    const second = getLangfuseClient();
    expect(first).toBe(second);
  });

  it("should create a new instance after reset", () => {
    const first = getLangfuseClient();
    resetLangfuseClient();
    const second = getLangfuseClient();
    expect(first).not.toBe(second);
  });
});
