請使用繁體中文回覆所有問題與建議。

# Copilot Instructions for langfuse-mcp

## Project Overview

`@jurislm/langfuse-mcp` is a Bun-based MCP (Model Context Protocol) server for Langfuse LLM observability. JurisLM 專用，提供 50 個工具用於 prompt 版本管理、執行追蹤與組織管理。Published to npm.

## Git Workflow

- **Development branch**: `develop` — all feature work happens here
- **Release branch**: `main` — receives changes via **squash merge** from `develop`
- **Versioning**: Managed by Release Please. Do NOT suggest manual version bumps.

## Build & Run

```bash
bun install               # install dependencies (use bun, not npm)
bun run dev               # start MCP server (stdio transport)
bun run build             # compile TypeScript → dist/
bun run typecheck         # tsc --noEmit
bun run lint              # ESLint (max-warnings=0)
```

Required environment variables:

```bash
export LANGFUSE_PUBLIC_KEY=pk-lf-...              # Public API auth
export LANGFUSE_SECRET_KEY=sk-lf-...              # Public API auth
export LANGFUSE_ADMIN_API_KEY=adm-lf-...          # Admin API (Instance/Organization tools)
export LANGFUSE_HOST=https://cloud.langfuse.com   # optional, this is the default
```

## Runtime: Bun

- Shebang: `#!/usr/bin/env bun` (not node)
- Uses native `fetch()` — no axios dependency
- All tool modules use `registerXxxTools(server: McpServer): void` pattern

## Tool Categories (50 tools)

### Public API Tools (28 tools)

| Category | File | Tools |
|----------|------|-------|
| Prompt Management | `src/tools/prompts.ts` | 6 tools |
| Traces | `src/tools/traces.ts` | 2 tools |
| Observations | `src/tools/observations.ts` | 2 tools |
| Scores | `src/tools/scores.ts` | 2 tools |
| Sessions | `src/tools/sessions.ts` | 1 tool |
| Datasets | `src/tools/datasets.ts` | 8 tools |
| Metrics | `src/tools/metrics.ts` | 2 tools |
| Score Configs | `src/tools/score-configs.ts` | 4 tools |
| Project | `src/tools/projects.ts` | 1 tool |

### Admin/Org API Tools (22 tools)

| Category | File | Auth |
|----------|------|------|
| Instance Management | `src/tools/instance-management.ts` | `LANGFUSE_ADMIN_API_KEY` |
| Organization Projects | `src/tools/organization-projects.ts` | `LANGFUSE_ADMIN_API_KEY` |
| Organization API Keys | `src/tools/organization-apikeys.ts` | `LANGFUSE_ADMIN_API_KEY` |
| Organization Memberships | `src/tools/organization-memberships.ts` | `LANGFUSE_ADMIN_API_KEY` |

## Authentication Architecture

兩套認證機制，`src/lib/api.ts` 的 `langfuseApi()` 統一管理：

- **Basic Auth** — Public API（`/api/public/*`）：base64(`PUBLIC_KEY:SECRET_KEY`)
- **Bearer Token** — Admin API（`/api/admin/*`）：`Authorization: Bearer LANGFUSE_ADMIN_API_KEY`

```typescript
await langfuseApi(path, {
  authType: "basic" | "admin-bearer" | "org-bearer",
  rawPath: boolean,  // true = 跳過 /api/public 前綴
})
```

## 核心設計概念

**Prompt 不可變性**：Prompt 每次修改都建立新版本，不更新現有版本。標籤（如 `"production"`）在版本間是 unique 的——設定某版本的標籤會自動移除其他版本的同名標籤。

## Adding New Tools

1. 建立 `src/tools/feature-name.ts`，定義 `registerFeatureTools(server: McpServer): void`
2. 在函數內用 `server.tool()` 註冊工具，附上 Zod schema
3. 在 `src/index.ts` import 並呼叫 `registerFeatureTools(server)`
4. 工具回傳格式：`{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`

## Code Review 重點

- 禁止使用 `any` 類型
- `LANGFUSE_PUBLIC_KEY`、`LANGFUSE_SECRET_KEY`、`LANGFUSE_ADMIN_API_KEY` 禁止 hardcode 或 log 輸出
- Prompt 相關工具：確認設計維持不可變性（新增 = 新版本）
- Admin 工具必須使用正確的 `authType: "admin-bearer"`，不能誤用 Basic Auth
- Label regex 限制：`/^[a-z0-9_\-.]+$/`（禁止放寬）
- `stdout` 保留給 MCP protocol；日誌用 `console.error()`

## 忽略範圍

- 不審查 `dist/`、`node_modules/`、`.worktrees/` 目錄
