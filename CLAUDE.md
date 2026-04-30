# CLAUDE.md — JurisLM Langfuse MCP Server

JurisLM 專用的 Langfuse MCP Server，提供 50 個工具用於 prompt 管理、可觀測性、實例管理與組織管理。

## 常用命令

```bash
# 開發
bun run dev              # 啟動 MCP server（stdio transport）
bun run typecheck        # 檢查 TypeScript 類型
bun run lint             # ESLint 檢查（max-warnings=0）

# 構建
bun run build            # 編譯到 dist/

# 環境變數
export LANGFUSE_PUBLIC_KEY=pk-lf-...              # 公開 API 認證
export LANGFUSE_SECRET_KEY=sk-lf-...              # 公開 API 認證
export LANGFUSE_ADMIN_API_KEY=adm-lf-...          # Admin API 認證（Instance/Organization）
export LANGFUSE_ORG_API_KEY=org-lf-...            # 組織 API 認證（可選）
export LANGFUSE_HOST=https://cloud.langfuse.com   # 預設，可省略
```

## Repository 概覽

**目的**：Langfuse 集成，為 JurisLM agents 提供 prompt 版本管理與執行追蹤查詢

**核心功能**：
- Prompt 版本管理（創建、更新、標籤管理）
- 執行追蹤（Traces）查詢
- 觀測點（Observations）查詢
- 評分（Scores）管理
- 會話（Sessions）查詢

**MCP 接口**：stdio transport（直接可執行）

## 結構

```
src/
├── index.ts           # MCP server 主入點，50 個 tools 註冊點
├── lib/
│   └── api.ts         # Langfuse API 客戶端（支援 Basic Auth / Bearer Token）
└── tools/
    ├── prompts.ts                 # Prompt Management（6 tools）
    ├── traces.ts                  # Traces（2 tools）
    ├── observations.ts            # Observations（2 tools）
    ├── scores.ts                  # Scores（2 tools）
    ├── sessions.ts                # Sessions（1 tool）
    ├── datasets.ts                # Dataset Management（8 tools）
    ├── metrics.ts                 # Metrics Query（2 tools）
    ├── score-configs.ts           # Score Configuration（4 tools）
    ├── projects.ts                # Project Query（1 tool）
    ├── instance-management.ts     # Instance Management（8 tools）
    ├── organization-projects.ts   # Organization Projects（5 tools）
    ├── organization-apikeys.ts    # Organization API Keys（3 tools）
    └── organization-memberships.ts # Organization Memberships（6 tools）
```

## 工具分類概述

**詳細的工具列表和參數說明見 README.md。**

### Tool Categories (50 total)

**Phase 1-3（Public API）— 28 tools**
1. **Prompt Management** (6 tools) — Version control & composition for prompts
2. **Traces** (2 tools) — Execution tracking & debugging
3. **Observations** (2 tools) — LLM calls & system operations analysis
4. **Scores** (2 tools) — Quality metrics & evaluation feedback
5. **Sessions** (1 tool) — Grouping related traces
6. **Datasets** (8 tools) — Eval data preparation & execution tracking
7. **Metrics** (2 tools) — Usage & performance summary
8. **Score Configurations** (4 tools) — Custom scoring metric definitions
9. **Project** (1 tool) — Current project metadata

**Phase 4-5（Admin/Organization APIs）— 22 tools**
10. **Instance Management** (8 tools) — Instance lifecycle & configuration
11. **Organization Projects** (5 tools) — Project management within organizations
12. **Organization API Keys** (3 tools) — Org-level API key management
13. **Organization Memberships** (6 tools) — Member & permission management

## 環境變數

| 變數 | 必需 | 說明 | 範例 |
|------|------|------|------|
| `LANGFUSE_PUBLIC_KEY` | ✓ | 公開 API 金鑰 | `pk-lf-xxxxx` |
| `LANGFUSE_SECRET_KEY` | ✓ | 公開 API 密鑰 | `sk-lf-xxxxx` |
| `LANGFUSE_ADMIN_API_KEY` | ✓* | Admin API Bearer Token | `adm-lf-xxxxx` |
| `LANGFUSE_ORG_API_KEY` | ✗ | 組織 API Bearer Token（可選） | `org-lf-xxxxx` |
| `LANGFUSE_HOST` | ✗ | API 伺服器地址（預設 cloud.langfuse.com）；**JurisLM 用 `https://us.cloud.langfuse.com`** | `https://us.cloud.langfuse.com` |

\* 若使用 Instance/Organization 管理工具則必需

## 實現細節

### 認證機制
- **Basic Auth**：用於公開 API（`/api/public/*`）
  - Base64 編碼 `PUBLIC_KEY:SECRET_KEY`
  - 工具：Prompt、Traces、Observations、Scores、Sessions、Datasets、Metrics、Score Configs、Project
- **Bearer Token（Admin）**：用於 Instance/Organization 管理（`/api/admin/*`）
  - `Authorization: Bearer LANGFUSE_ADMIN_API_KEY`
  - 工具：Instance Management、Organization Projects、Organization API Keys、Organization Memberships

### API 端點
- Public API：`/api/public/v2/*`
  - `/prompts`, `/traces`, `/observations`, `/scores`, `/sessions`
- Admin API：`/api/admin/*`
  - `/instances`, `/organizations/{orgId}/projects`, `/organizations/{orgId}/api-keys`, `/organizations/{orgId}/members`

### API 客戶端
`langfuseApi()` 函數支援多認證方式：
```typescript
langfuseApi(path, {
  authType: "basic" | "admin-bearer" | "org-bearer",
  rawPath: boolean,  // 跳過 /api/public 前綴
  params: {...},
  body: {...}
})
```

### 錯誤處理
所有 API 呼叫失敗時拋出 Error，包含 HTTP status + 回應文本。

## 開發指南

### 新增工具（模組化模式）
1. 建立新工具模組 `src/tools/feature-name.ts`
2. 定義 `registerFeatureTools(server: McpServer): void` 函數
3. 在該函數內呼叫 `server.tool()`
4. 定義 Zod schema（輸入參數驗證）
5. 實現非同步 handler，呼叫 `langfuseApi()`
6. 在 `src/index.ts` 內 import 並呼叫 `registerFeatureTools(server)`

### 多認證支援
新工具若需要不同認證方式，修改 `langfuseApi()` 呼叫：
```typescript
await langfuseApi(path, {
  authType: "admin-bearer",  // 切換認證類型
  rawPath: true,             // 若需要跳過 /api/public 前綴
})
```

### 版本號
`package.json` 中的 `version` 字段由 Release Please 管理，勿手動修改。

### 類型檢查
`bun run typecheck` 強制檢查（CI 必過）。

### Linting
`bun run lint` 強制零警告（CI 必過）。

### 開發流程
```bash
bun run dev        # 啟動開發伺服器
bun run build      # 編譯到 dist/
```

## 部署

### 本地測試
```bash
bun run dev
```
即可直接運行 MCP server。

### Claude Code 整合
```json
{
  "mcpServers": {
    "langfuse": {
      "command": "bunx",
      "args": ["github:jurislm/langfuse-mcp"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "...",
        "LANGFUSE_SECRET_KEY": "...",
        "LANGFUSE_HOST": "https://cloud.langfuse.com"
      }
    }
  }
}
```

## 參考資料

- [Langfuse API Docs](https://langfuse.com/docs/api)
- [Langfuse Prompt Management](https://langfuse.com/docs/prompt-management)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
