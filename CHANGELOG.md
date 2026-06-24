# Changelog

## [1.3.1](https://github.com/jurislm/langfuse-mcp/compare/v1.3.0...v1.3.1) (2026-06-24)


### Bug Fixes

* **api:** resolve LANGFUSE_HOST lazily so .env.langfuse host is honored ([#20](https://github.com/jurislm/langfuse-mcp/issues/20)) ([a641c3f](https://github.com/jurislm/langfuse-mcp/commit/a641c3fb3ce0823750418f7a912eb63dbfa72e4e))

## [1.3.0](https://github.com/jurislm/langfuse-mcp/compare/v1.2.0...v1.3.0) (2026-05-06)


### Features

* **env:** per-project .env.langfuse credential override ([#17](https://github.com/jurislm/langfuse-mcp/issues/17)) ([458efe9](https://github.com/jurislm/langfuse-mcp/commit/458efe9873847380112ab3bb419243f2b7962bd3))


### Documentation

* note JurisLM-specific LANGFUSE_HOST (us.cloud.langfuse.com) ([917a1cf](https://github.com/jurislm/langfuse-mcp/commit/917a1cff4440868a3763f332a730d71ab3318390))

## [1.2.0](https://github.com/jurislm/langfuse-mcp/compare/v1.1.2...v1.2.0) (2026-04-24)


### Features

* integrate Langfuse JS SDK — typed client, LangfuseApiError, withRetry, DI for traces/observations/sessions ([#8](https://github.com/jurislm/langfuse-mcp/issues/8)) ([1757ead](https://github.com/jurislm/langfuse-mcp/commit/1757ead602b469cd7f27e389fd105de48ad8645a))


### Bug Fixes

* **api:** integrate withRetry into langfuseApi and fix lastError type safety ([#10](https://github.com/jurislm/langfuse-mcp/issues/10)) ([110fae8](https://github.com/jurislm/langfuse-mcp/commit/110fae8a3b724c3aa5e04bf0be0d311c52e41979))

## [1.1.2](https://github.com/jurislm/langfuse-mcp/compare/v1.1.1...v1.1.2) (2026-04-12)


### Refactoring

* Comprehensive Langfuse MCP with 50 tools, schema validation, and API testing ([3a21373](https://github.com/jurislm/langfuse-mcp/commit/3a213734e7a5a0704c7e030838cc71a53567f840))

## [1.1.1](https://github.com/jurislm/langfuse-mcp/compare/v1.1.0...v1.1.1) (2026-04-10)


### Documentation

* update README with npx install instructions and plugin usage ([ea82ea2](https://github.com/jurislm/langfuse-mcp/commit/ea82ea206d9ce8cd25428f6c450781e1d685b784))
* use bunx instead of npx in MCP configuration example ([755cf76](https://github.com/jurislm/langfuse-mcp/commit/755cf76d3d58df5944ba9f5df52cc6cfbef90797))

## [1.1.0](https://github.com/jurislm/langfuse-mcp/compare/v1.0.1...v1.1.0) (2026-04-10)


### Features

* JurisLM Langfuse MCP Server — 15 tools ([13a4303](https://github.com/jurislm/langfuse-mcp/commit/13a43031bca22b04bead8ca15b7ef85f8c546394))


### Bug Fixes

* add bin field, fix main to dist/index.js, include dist in npm files ([e372816](https://github.com/jurislm/langfuse-mcp/commit/e372816508053bf314ce81b14344b4c418248617))


### Documentation

* add README with tools overview and setup guide ([5b586a4](https://github.com/jurislm/langfuse-mcp/commit/5b586a47979d4bf6f8b1cceb4b642d6a24785f09))
* update README and add CLAUDE.md + release workflow fixes ([ed49275](https://github.com/jurislm/langfuse-mcp/commit/ed49275e511fd66b461cdcd08c013dc06db1b227))
* update README tools overview and add CLAUDE.md ([ca80125](https://github.com/jurislm/langfuse-mcp/commit/ca80125befd54d1e3c664bd52d1db67412e01cc0))

## 1.0.0 (2026-04-09)


### Features

* JurisLM Langfuse MCP Server — 15 tools ([13a4303](https://github.com/jurislm/langfuse-mcp/commit/13a43031bca22b04bead8ca15b7ef85f8c546394))
