# CLAUDE.md — JurisLM Langfuse MCP Server

JurisLM 專用的 Langfuse MCP Server，提供 28 個工具用於 prompt 管理、資料集操作、可觀測性與指標查詢。

## 常用命令

```bash
# 開發
bun run dev              # 啟動 MCP server（stdio transport）
bun run typecheck        # 檢查 TypeScript 類型
bun run lint             # ESLint 檢查（max-warnings=0）

# 構建
bun run build            # 編譯到 dist/

# 環境變數
export LANGFUSE_PUBLIC_KEY=pk-lf-...
export LANGFUSE_SECRET_KEY=sk-lf-...
export LANGFUSE_HOST=https://cloud.langfuse.com  # 預設，可省略
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
├── index.ts           # MCP server 主入點，28 個 tools 註冊點
├── lib/
│   └── api.ts         # Langfuse API 客戶端（HTTP Basic Auth）
└── tools/
    ├── prompts.ts     # Prompt Management（6 tools）
    ├── traces.ts      # Traces（2 tools）
    ├── observations.ts # Observations（2 tools）
    ├── scores.ts      # Scores（2 tools）
    ├── sessions.ts    # Sessions（1 tool）
    ├── datasets.ts    # Dataset Management（8 tools）
    ├── metrics.ts     # Metrics Query（2 tools）
    ├── score-configs.ts # Score Configuration（4 tools）
    └── projects.ts    # Project Query（1 tool）
```

## 工具分類概述

**詳細的工具列表和參數說明見 README.md。**

### Tool Categories (28 total)

1. **Prompt Management** (6 tools) — Version control & composition for prompts
2. **Traces** (2 tools) — Execution tracking & debugging
3. **Observations** (2 tools) — LLM calls & system operations analysis
4. **Scores** (2 tools) — Quality metrics & evaluation feedback
5. **Sessions** (1 tool) — Grouping related traces
6. **Datasets** (8 tools) — Eval data preparation & execution tracking
7. **Metrics** (2 tools) — Usage & performance summary
8. **Score Configurations** (4 tools) — Custom scoring metric definitions
9. **Project** (1 tool) — Current project metadata

## 環境變數

| 變數 | 必需 | 說明 | 範例 |
|------|------|------|------|
| `LANGFUSE_PUBLIC_KEY` | ✓ | 公開金鑰 | `pk-lf-xxxxx` |
| `LANGFUSE_SECRET_KEY` | ✓ | 密鑰 | `sk-lf-xxxxx` |
| `LANGFUSE_HOST` | ✗ | API 伺服器地址（預設 cloud.langfuse.com） | `https://cloud.langfuse.com` |

## 實現細節

### 認證
使用 HTTP Basic Auth（base64 編碼 `PUBLIC_KEY:SECRET_KEY`），Langfuse 公開 API 標準方式。

### API 端點
直接呼叫 Langfuse `/api/public/*` 端點：
- `/v2/prompts` — Prompt Management
- `/traces` — Traces
- `/observations` — Observations
- `/scores` — Scores
- `/sessions` — Sessions

### 錯誤處理
所有 API 呼叫失敗時拋出 Error，包含 HTTP status + 回應文本。

## 開發指南

### 新增工具
1. 在 `src/index.ts` 內加入 `server.tool()` 呼叫
2. 定義 Zod schema（輸入參數驗證）
3. 實現非同步 handler，呼叫 `langfuseApi()`
4. 回傳 MCP 格式：`{ content: [{ type: "text", text: JSON.stringify(...) }] }`

### 版本號
`package.json` 中的 `version` 字段由 Release Please 管理，勿手動修改。

### 類型檢查
`tsc --noEmit` 強制檢查（CI 必過）。

### ESLint
`eslint --max-warnings=0` 強制零警告（CI 必過）。

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
