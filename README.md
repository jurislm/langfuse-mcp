# langfuse-mcp

MCP (Model Context Protocol) server for [Langfuse](https://langfuse.com) — provides 13 tools for prompt management and observability (traces, observations, scores) via natural language.

## Tools

### Prompt Management (6 tools)
- `list_prompts` — List all prompts with optional name filter
- `get_prompt` — Get a specific prompt version
- `create_prompt` — Create a new prompt
- `update_prompt` — Update an existing prompt
- `delete_prompt` — Delete a prompt
- `get_prompt_versions` — List all versions of a prompt

### Traces & Observations (5 tools)
- `list_traces` — List traces with optional filters
- `get_trace` — Get a specific trace with observations
- `list_observations` — List observations with filters
- `get_observation` — Get a specific observation

### Scores (2 tools)
- `create_score` — Create a score for a trace
- `list_scores` — List scores with filters

## Setup

### Environment Variables

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com  # or your self-hosted URL
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
        "LANGFUSE_BASE_URL": "https://cloud.langfuse.com"
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
