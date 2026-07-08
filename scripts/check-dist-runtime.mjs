#!/usr/bin/env node
// 守衛「實際出貨的產物」，而非原始碼。
//
// 這個套件是被 `npx @jurislm/langfuse-mcp` 啟動的，執行環境不保證有 bun。
// 只檢查 src/index.ts 的 shebang 不夠 —— npx 執行的是 dist/index.js。
// 任何讓 dist 退回 bun 的變更（換 bundler、加 postbuild、bun 預設值改變）
// 都必須在 publish 前擋下，而不是等使用者踩到 `env: bun: No such file or directory`。
//
// 由 prepublishOnly 呼叫，剛好落在產物產生之後、上傳 npm 之前。
import { readFileSync } from "node:fs";

const DIST = new URL("../dist/index.js", import.meta.url);

const fail = (msg) => {
  console.error(`✗ dist runtime check: ${msg}`);
  process.exit(1);
};

let source;
try {
  source = readFileSync(DIST, "utf8");
} catch {
  fail("dist/index.js not found — run `bun run build` first");
}

const shebang = source.split("\n", 1)[0];
if (shebang !== "#!/usr/bin/env node") {
  fail(`dist/index.js shebang is ${JSON.stringify(shebang)}, expected "#!/usr/bin/env node"`);
}

// bun build --target bun 會把 Bun.* 的呼叫留在 bundle 裡；--target node 不會。
const bunApiRefs = source.match(/\bBun\.[a-zA-Z]/g);
if (bunApiRefs) {
  fail(`dist/index.js references bun-only APIs: ${[...new Set(bunApiRefs)].join(", ")}`);
}

console.log("✓ dist runtime check: node shebang, no bun-only APIs");
