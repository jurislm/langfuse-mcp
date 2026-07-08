import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 這個套件透過 `npx @jurislm/langfuse-mcp` 被 Claude Code 啟動，
// 執行環境不保證有 bun。若 shebang 或 build target 退回 bun，
// 任何沒有 bun 在 PATH 的環境都會以 `env: bun: No such file or directory` 失敗。
describe("published binary must run under plain node", () => {
  const entry = fileURLToPath(new URL("./index.ts", import.meta.url));
  const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"));

  it("entrypoint uses a node shebang", () => {
    expect(readFileSync(entry, "utf8").split("\n")[0]).toBe("#!/usr/bin/env node");
  });

  it("build targets node, not bun", () => {
    expect(pkg.scripts.build).toContain("--target node");
  });
});
