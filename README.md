# @jurislm/langfuse-mcp

MCP (Model Context Protocol) server for [Langfuse](https://langfuse.com) — provides 13 tools for prompt management and observability (traces, observations, scores, sessions) via natural language.

## Tools

### Prompt Management (6 tools)
- `listPrompts` — List and filter prompts with pagination, labels, tags
- `getPrompt` — Fetch a specific prompt version with resolved dependencies
- `createTextPrompt` — Create a text prompt version (supports `{{variable}}` syntax)
- `createChatPrompt` — Create a chat prompt with role-based messages
- `getPromptUnresolved` — Fetch a prompt without resolving dependencies (for debugging composition)
- `updatePromptLabels` — Update labels for a prompt version (labels are unique across versions)

### Traces (2 tools)
- `listTraces` — List traces with pagination and optional filters (name, userId, time range)
- `getTrace` — Get a single trace with full details and observations

### Observations (2 tools)
- `listObservations` — List observations (GENERATION, SPAN, EVENT) with filters
- `getObservation` — Get a single observation with full details (input, output, usage, model, duration)

### Scores (2 tools)
- `createScore` — Create a score for a trace or observation (for evals, user feedback, quality metrics)
- `listScores` — List scores with filters

### Sessions (1 tool)
- `listSessions` — List sessions that group related traces together

## Setup

### Environment Variables

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # optional, defaults to cloud.langfuse.com
# US region: https://us.cloud.langfuse.com
```

### Usage with Claude Code (via npx)

Add to your MCP configuration (`.mcp.json` or `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "langfuse": {
      "command": "bunx",
      "args": ["@jurislm/langfuse-mcp@latest"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "pk-lf-...",
        "LANGFUSE_SECRET_KEY": "sk-lf-...",
        "LANGFUSE_HOST": "https://cloud.langfuse.com"
      }
    }
  }
}
```

> **Note:** Requires [Bun](https://bun.sh) installed globally (`curl -fsSL https://bun.sh/install | bash`).

### Usage with Claude Code Plugin (jurislm-tools)

If you use the [jurislm-tools](https://github.com/jurislm/jurislm-tools) Claude Code plugin, `jt:langfuse` is included:

```
/plugin marketplace update jurislm-tools
```

Then set environment variables in `~/.zshenv`:

```bash
export LANGFUSE_PUBLIC_KEY=pk-lf-...
export LANGFUSE_SECRET_KEY=sk-lf-...
export LANGFUSE_HOST=https://us.cloud.langfuse.com
```

## Development

```bash
bun install
bun run dev        # Run locally (stdio transport)
bun run build      # Build to dist/
bun run typecheck  # TypeScript check
bun run lint       # ESLint (max-warnings=0)
```

## License

MIT
