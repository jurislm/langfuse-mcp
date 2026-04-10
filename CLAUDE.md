# CLAUDE.md — JurisLM Langfuse MCP Server

JurisLM 專用的 Langfuse MCP Server，提供 13 個工具用於 prompt 管理與可觀測性查詢。

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
├── index.ts           # MCP server 實現，13 個 tools 定義
                       # 1. Prompt Management（6 tools）
                       # 2. Traces（2 tools）
                       # 3. Observations（2 tools）
                       # 4. Scores（2 tools）
                       # 5. Sessions（1 tool）
```

## 工具分類詳解

### 1. Prompt Management（6 tools）
複製官方 Langfuse MCP 的 prompt API，超高階版本控制：

- **listPrompts** — 列舉所有 prompts，支援分頁、名稱篩選、標籤篩選
- **getPrompt** — 取得指定 prompt 版本，自動解析依賴（用於 prompt composition）
- **createTextPrompt** — 建立新的文字 prompt 版本，支援 `{{variable}}` 語法
- **createChatPrompt** — 建立新的聊天 prompt（role-based messages：system/user/assistant）
- **getPromptUnresolved** — 取得 prompt 但**不解析依賴**（用於偵錯 prompt 組合）
- **updatePromptLabels** — 更新 prompt 版本的標籤（標籤在版本間是 unique 的）

**設計模式**：Prompts 是不可變的，每次修改都建立新版本。用標籤（如 "production"）指向特定版本。

### 2. Traces（2 tools）
執行追蹤查詢（JurisLM 擴充）：

- **listTraces** — 列舉 traces，支援按名稱、userId、標籤、時間範圍篩選
- **getTrace** — 取得單個 trace 及其所有 observations 和 scores

**用途**：查詢 agents 的執行記錄，分析決策過程。

### 3. Observations（2 tools）
觀測點查詢（JurisLM 擴充）：

- **listObservations** — 列舉 observations（GENERATION/SPAN/EVENT），支援按 type/name/traceId 篩選
- **getObservation** — 取得單個 observation 的完整詳情（input/output/usage/model/duration）

**用途**：分析 LLM 調用、API 響應、系統操作等細節。

### 4. Scores（2 tools）
評分管理（JurisLM 擴充）：

- **createScore** — 為 trace 或 observation 建立評分（用於 evals、用戶反饋、品質指標）
- **listScores** — 列舉 scores，支援按名稱、userId、traceId 篩選

**用途**：記錄執行品質指標，訓練改進迴圈。

### 5. Sessions（1 tool）
會話查詢（JurisLM 擴充）：

- **listSessions** — 列舉 sessions（group 相關 traces），支援時間範圍篩選

**用途**：組織相關的執行記錄。

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
