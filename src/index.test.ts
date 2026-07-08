import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 這個套件透過 `npx @jurislm/langfuse-mcp` 被 Claude Code 啟動，
// 執行環境不保證有 bun。若 shebang 退回 bun，任何沒有 bun 在 PATH 的
// 環境都會以 `env: bun: No such file or directory` 失敗。
//
// 這裡只給早期訊號（改壞原始碼時立刻 fail）。真正出貨的 dist/index.js
// 由 scripts/check-dist-runtime.mjs 在 prepublishOnly 把關。
describe("entrypoint must target plain node", () => {
  const entry = fileURLToPath(new URL("./index.ts", import.meta.url));

  it("uses a node shebang", () => {
    expect(readFileSync(entry, "utf8").split("\n")[0]).toBe("#!/usr/bin/env node");
  });
});
