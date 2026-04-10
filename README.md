# langfuse-mcp

MCP (Model Context Protocol) server for [Langfuse](https://langfuse.com) — provides 13 tools for prompt management and observability (traces, observations, scores, sessions) via natural language.

## Tools

### Prompt Management (6 tools)
- `listPrompts` — List and filter prompts with pagination, labels, tags
- `getPrompt` — Fetch a specific prompt version with resolved dependencies
- `createTextPrompt` — Create a text prompt version (supports {{variable}} syntax)
- `createChatPrompt` — Create a chat prompt with role-based messages
- `getPromptUnresolved` — Fetch a prompt without resolving dependencies (for debugging composition)
- `updatePromptLabels` — Update labels for a prompt version

### Traces (2 tools)
- `listTraces` — List traces with pagination and optional filters
- `getTrace` — Get a single trace with full details and observations

### Observations (2 tools)
- `listObservations` — List observations (generations, spans, events) with filters
- `getObservation` — Get a single observation with full details

### Scores (2 tools)
- `createScore` — Create a score for a trace or observation
- `listScores` — List scores with filters

### Sessions (1 tool)
- `listSessions` — List sessions that group related traces together

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
