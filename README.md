# langfuse-mcp

MCP (Model Context Protocol) server for [Langfuse](https://langfuse.com) — provides 28 tools for prompt management, dataset operations, observability, and metrics tracking via natural language.

## Tools (28)

### Prompt Management (6 tools)
- `listPrompts` — List and filter prompts with pagination, labels, tags
- `getPrompt` — Fetch a specific prompt version with resolved dependencies
- `createTextPrompt` — Create a text prompt version (supports {{variable}} syntax)
- `createChatPrompt` — Create a chat prompt with role-based messages
- `getPromptUnresolved` — Fetch a prompt without resolving dependencies (for debugging composition)
- `updatePromptLabels` — Update labels for a prompt version

### Traces (2 tools)
- `listTraces` — List traces with pagination and optional filters (name, userId, tags, timestamps)
- `getTrace` — Get a single trace with full details, observations, and scores

### Observations (2 tools)
- `listObservations` — List observations (generations, spans, events) with filters by type and name
- `getObservation` — Get a single observation with complete details (input, output, model, usage, duration)

### Scores (2 tools)
- `createScore` — Create a score for a trace or observation (for evals, feedback, quality metrics)
- `listScores` — List scores with pagination and optional filters

### Sessions (1 tool)
- `listSessions` — List sessions that group related traces together across time ranges

### Datasets (8 tools)
- `listDatasets` — List datasets for evals and benchmarking with search and pagination
- `getDataset` — Get dataset details with metadata and item counts
- `createDataset` — Create a new dataset for evals or benchmarking
- `listDatasetItems` — List items in a dataset with pagination (input/output pairs)
- `createDatasetItem` — Add an input/output pair to a dataset for eval testing
- `getDatasetItem` — Get a single dataset item by ID
- `listDatasetRuns` — List eval execution runs (traces using this dataset)
- `getDatasetRun` — Get details of a dataset run (eval execution)

### Metrics (2 tools)
- `getDailyMetrics` — Get daily metrics for traces and observations (latency, tokens, scores, cost)
- `getUsageSummary` — Get usage summary for a time period (total traces, observations, tokens, cost)

### Score Configurations (4 tools)
- `listScoreConfigs` — List all score configurations (custom score names and data types)
- `getScoreConfig` — Get details of a score configuration including name, data type, and categories
- `createScoreConfig` — Create a new score configuration for custom scoring metrics
- `updateScoreConfig` — Update an existing score configuration

### Project (1 tool)
- `getProject` — Get current project details (name, API keys, limits, usage)

## Setup

### Environment Variables

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # optional, defaults to cloud.langfuse.com
```

### Usage with Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "langfuse": {
      "command": "bunx",
      "args": ["github:jurislm/langfuse-mcp"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "pk-lf-...",
        "LANGFUSE_SECRET_KEY": "sk-lf-...",
        "LANGFUSE_HOST": "https://cloud.langfuse.com"
      }
    }
  }
}
```

## Development

```bash
bun install
bun run dev        # Run locally
bun run build      # Build to dist/
bun run typecheck  # TypeScript check
bun run lint       # ESLint
```

## License

MIT
