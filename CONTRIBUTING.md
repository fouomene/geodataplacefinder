# Contributing to GeoDataPlacefinder

Thank you for your interest in contributing. This document explains how to get started, what we look for in contributions, and how the review process works.

---

## Table of contents

1. [Code of conduct](#code-of-conduct)
2. [Getting started](#getting-started)
3. [How to contribute](#how-to-contribute)
4. [Development workflow](#development-workflow)
5. [Coding standards](#coding-standards)
6. [Commit messages](#commit-messages)
7. [Pull request process](#pull-request-process)
8. [Reporting bugs](#reporting-bugs)
9. [Requesting features](#requesting-features)

---

## Code of conduct

Please be respectful and constructive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. Harassment, trolling, or exclusionary behaviour will not be tolerated.

---

## Getting started

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/geodataplacefinder.git
cd geodataplacefinder

# Install dependencies (Node.js 20+ and pnpm 9+ required)
pnpm install

# Start the API server
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the frontend
pnpm --filter @workspace/geodata-web run dev
```

The first API server start takes ~15 seconds while DuckDB fetches the Overture Maps sample data from S3. Subsequent starts are instant.

---

## How to contribute

### Bug fixes

1. Check the [open issues](https://github.com/your-org/geodataplacefinder/issues) to see if it is already tracked.
2. If not, open a new issue describing the bug before starting work.
3. Fork, fix, and open a pull request referencing the issue.

### New features

1. Open an issue describing the feature and the problem it solves.
2. Wait for a maintainer to confirm the idea is in scope before investing time.
3. Fork, implement, and open a pull request.

### Documentation

Documentation improvements (README, API docs, code comments) are always welcome. Open a pull request directly without a prior issue.

### Overture Maps data coverage

The default sample is ~50 000 rows across 5 S3 files. If you want to extend coverage, edit `SAMPLE_FILES` and `ROWS_PER_FILE` in `artifacts/api-server/src/lib/duckdb.ts`. Please document the trade-off in your pull request.

---

## Development workflow

This is a pnpm monorepo. Key commands:

```bash
# Full typecheck (all packages)
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API hooks and Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

**Important rules:**

- Never run `pnpm dev` at the workspace root — run per-package dev scripts instead.
- After any change to `lib/api-spec/openapi.yaml`, run `codegen` before touching dependent code.
- Never use `console.log` in server code — use `req.log` in route handlers and the `logger` singleton elsewhere.
- Delete `artifacts/api-server/data/places.duckdb` and restart the server after changing the DuckDB schema or sample size.

### Project structure

```
artifacts/
  api-server/       Express 5 API server
  geodata-web/      React + Vite demo site
lib/
  api-spec/         OpenAPI spec (source of truth)
  api-client-react/ Generated React Query hooks
  api-zod/          Generated Zod schemas
```

---

## Coding standards

- **TypeScript** — strict mode, no `any` unless unavoidable (add a comment explaining why).
- **Formatting** — Prettier with the repo defaults. Run `pnpm prettier --write .` before committing.
- **Linting** — ESLint. Run `pnpm eslint .` and fix all warnings before opening a PR.
- **API changes** — always update `lib/api-spec/openapi.yaml` first, then run `codegen`. Do not hand-edit generated files.
- **Tests** — add or update tests for any changed behaviour. The test suite runs with `pnpm test`.
- **No secrets in code** — use environment variables; never commit API keys, tokens, or credentials.

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Examples:

```
feat(api): add /api/places/:id endpoint
fix(duckdb): handle null categories.primary gracefully
docs: update README with Docker compose example
```

---

## Pull request process

1. **Branch naming** — `feat/<short-description>`, `fix/<short-description>`, or `docs/<short-description>`.
2. **PR description** — explain what changed and why. Link to the related issue with `Closes #<number>`.
3. **Typecheck must pass** — `pnpm run typecheck` must exit cleanly before requesting review.
4. **Keep it focused** — one logical change per PR. Large PRs are hard to review and likely to be sent back for splitting.
5. **Review** — at least one maintainer approval is required before merging.
6. **Merge strategy** — squash merge to keep the main branch history clean.

---

## Reporting bugs

Open an issue with:

- A clear title
- Steps to reproduce
- Expected behaviour vs actual behaviour
- Relevant log output or error messages
- Your environment (OS, Node version, pnpm version)

---

## Requesting features

Open an issue with:

- A description of the problem you are trying to solve
- Your proposed solution (optional)
- Any alternatives you considered

Feature requests are evaluated based on alignment with the project goals (open-source, DuckDB-based, no external API dependencies) and maintainer capacity.
