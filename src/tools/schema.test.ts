import { describe, it, expect } from "bun:test";
import { z } from "zod";

describe("Zod Schema Validation", () => {
  describe("datetime validation", () => {
    it("should accept ISO 8601 datetime with timezone", () => {
      const schema = z.string().datetime({ offset: true });
      expect(schema.safeParse("2024-01-15T10:30:00Z").success).toBe(true);
      expect(schema.safeParse("2024-01-15T10:30:00+02:00").success).toBe(true);
    });

    it("should reject invalid date strings", () => {
      const schema = z.string().datetime({ offset: true });
      expect(schema.safeParse("not-a-date").success).toBe(false);
      expect(schema.safeParse("2024-13-01T00:00:00Z").success).toBe(false);
      expect(schema.safeParse("2024-01-32T00:00:00Z").success).toBe(false);
    });

    it("should reject date-only strings without time component", () => {
      const schema = z.string().datetime({ offset: true });
      expect(schema.safeParse("2024-01-15").success).toBe(false);
    });
  });

  describe("min-value constraints", () => {
    it("should accept positive integers for maxUsers", () => {
      const schema = z.number().int().min(1).optional();
      expect(schema.safeParse(1).success).toBe(true);
      expect(schema.safeParse(100).success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    it("should reject zero and negative values for maxUsers", () => {
      const schema = z.number().int().min(1).optional();
      expect(schema.safeParse(0).success).toBe(false);
      expect(schema.safeParse(-1).success).toBe(false);
    });

    it("should accept positive integers for maxRequests", () => {
      const schema = z.number().int().min(1).optional();
      expect(schema.safeParse(1).success).toBe(true);
      expect(schema.safeParse(5000).success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    it("should reject floats for integer fields", () => {
      const schema = z.number().int().min(1).optional();
      expect(schema.safeParse(1.5).success).toBe(false);
      expect(schema.safeParse(0.1).success).toBe(false);
    });
  });

  describe("ID format validation", () => {
    it("should accept valid ID formats", () => {
      const schema = z.string().regex(/^[a-zA-Z0-9_-]+$/);
      expect(schema.safeParse("instance-id").success).toBe(true);
      expect(schema.safeParse("instanceId").success).toBe(true);
      expect(schema.safeParse("instance_id").success).toBe(true);
      expect(schema.safeParse("123").success).toBe(true);
    });

    it("should reject invalid ID formats with special characters", () => {
      const schema = z.string().regex(/^[a-zA-Z0-9_-]+$/);
      expect(schema.safeParse("instance/id").success).toBe(false);
      expect(schema.safeParse("instance..id").success).toBe(false);
      expect(schema.safeParse("instance id").success).toBe(false);
      expect(schema.safeParse("instance@id").success).toBe(false);
      expect(schema.safeParse("..").success).toBe(false);
      expect(schema.safeParse("../../etc/passwd").success).toBe(false);
    });

    it("should reject empty strings", () => {
      const schema = z.string().regex(/^[a-zA-Z0-9_-]+$/);
      expect(schema.safeParse("").success).toBe(false);
    });
  });

  describe("email validation", () => {
    it("should accept valid email addresses", () => {
      const schema = z.string().email();
      expect(schema.safeParse("user@example.com").success).toBe(true);
      expect(schema.safeParse("john.doe+tag@company.co.uk").success).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      const schema = z.string().email();
      expect(schema.safeParse("not-an-email").success).toBe(false);
      expect(schema.safeParse("@example.com").success).toBe(false);
      expect(schema.safeParse("user@").success).toBe(false);
    });
  });
});
