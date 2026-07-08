# @jurislm/langfuse-mcp

MCP (Model Context Protocol) server for [Langfuse](https://langfuse.com) — provides 50 tools for prompt management, observability, instance/organization management, and metrics tracking via natural language.

## Tools (50)

### Prompt Management (6 tools)
- `listPrompts` — List and filter prompts with pagination, labels, tags
- `getPrompt` — Fetch a specific prompt version with resolved dependencies
- `createTextPrompt` — Create a text prompt version (supports `{{variable}}` syntax)
- `createChatPrompt` — Create a chat prompt with role-based messages
- `getPromptUnresolved` — Fetch a prompt without resolving dependencies (for debugging composition)
- `updatePromptLabels` — Update labels for a prompt version (labels are unique across versions)

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

### Instance Management (8 tools)
- `listInstances` — List all Langfuse instances with pagination
- `getInstance` — Get details of a specific instance
- `createInstance` — Create a new instance
- `updateInstance` — Update an existing instance
- `deleteInstance` — Delete an instance
- `listInstanceEvents` — List events for an instance
- `getInstanceStatus` — Get health and status information
- `configureInstanceSettings` — Configure advanced settings

### Organization Projects (5 tools)
- `listOrganizationProjects` — List all projects within an organization
- `getOrganizationProject` — Get details of a specific project
- `createOrganizationProject` — Create a new project in an organization
- `updateOrganizationProject` — Update an existing project
- `deleteOrganizationProject` — Delete a project from an organization

### Organization API Keys (3 tools)
- `listOrganizationApiKeys` — List all API keys for an organization
- `createOrganizationApiKey` — Create a new API key
- `deleteOrganizationApiKey` — Delete an API key

### Organization Memberships (6 tools)
- `listOrganizationMembers` — List all members of an organization
- `addOrganizationMember` — Add a new member to an organization
- `updateOrganizationMember` — Update a member's role or permissions
- `removeOrganizationMember` — Remove a member from an organization
- `listProjectMembers` — List members with access to a specific project
- `updateProjectMember` — Update a member's access level for a project

## Setup

### Environment Variables

```bash
# Public API (Required for Prompt Management, Traces, Observations, Scores, Sessions, etc.)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...

# Instance/Organization Management APIs (Required for Instance and Organization tools)
LANGFUSE_ADMIN_API_KEY=adm-lf-...

# Optional: Organization-specific API key for additional org-level tools
LANGFUSE_ORG_API_KEY=org-lf-...

# Optional: API Server (defaults to https://cloud.langfuse.com)
LANGFUSE_HOST=https://cloud.langfuse.com
# US region: https://us.cloud.langfuse.com
```

### Usage with Claude Code (via npx)

Add to your MCP configuration (`.mcp.json` or `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "langfuse": {
      "command": "npx",
      "args": ["-y", "@jurislm/langfuse-mcp@latest"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "pk-lf-...",
        "LANGFUSE_SECRET_KEY": "sk-lf-...",
        "LANGFUSE_HOST": "https://cloud.langfuse.com"
      }
    }
  }
}
```

> **Note:** Runtime requires only **Node.js >= 18** — the published binary runs under plain `node`, so `npx` works without any extra tooling.
> [Bun](https://bun.sh) is needed **only for local development** (see [Development](#development)), never to run this server.

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
