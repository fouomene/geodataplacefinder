# GeoDataPlacefinder

An open-source geocoding API and demo site that converts addresses into coordinates (and vice versa) using Overture Maps data queried through DuckDB — no Google Maps or Nominatim required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/geodata-web run dev` — run the frontend (port 25276)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Geocoding engine: DuckDB + Overture Maps Parquet files (remote HTTPS, no local storage)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, React Query

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/duckdb.ts` — DuckDB singleton + Overture Places URL
- `artifacts/api-server/src/routes/search.ts` — GET /api/search (geocoding)
- `artifacts/api-server/src/routes/reverse.ts` — GET /api/reverse (reverse geocoding)
- `artifacts/api-server/src/routes/nearest.ts` — GET /api/places/nearest
- `artifacts/geodata-web/src/` — React frontend (demo + docs)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas

## Architecture decisions

- DuckDB as a singleton (connection created once, reused across requests) to avoid re-initialization overhead per request
- Overture Maps data queried via remote HTTPS Parquet files — no local storage needed; DuckDB's `httpfs` extension handles this transparently
- Spatial queries use `ST_Transform` + `EPSG:3857` for meter-accurate distance calculations
- OpenAPI-first: all types, hooks, and Zod validators are generated from `lib/api-spec/openapi.yaml`
- DuckDB native binary added to `onlyBuiltDependencies` in `pnpm-workspace.yaml` so it compiles on `pnpm install`

## Product

- **Geocoding** (`GET /api/search`) — search by free-form text, name, city, postcode, or category type
- **Reverse geocoding** (`GET /api/reverse`) — coordinates → nearest places with distances
- **Nearest place** (`GET /api/places/nearest`) — single closest place within a configurable radius
- **Live demo site** at `/` — interactive API playground with JSON response viewer
- **API docs** at `/docs` — full endpoint reference with curl examples

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- DuckDB queries against remote Parquet files are slow on first call (cold start) — DuckDB must fetch data over HTTPS from Overture Maps CDN
- The spatial extension must be loaded before any `ST_*` functions can be used
- Always add DuckDB to `onlyBuiltDependencies` in `pnpm-workspace.yaml` — without it, `pnpm install` skips the native binary compilation
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using the updated types

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Overture Maps data URL: `https://data.overturemaps.org/releases/latest/theme=places/type=place/*.parquet`
