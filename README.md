# GeoDataPlacefinder

An open-source geocoding API and demo site that converts addresses into geographic coordinates (and vice versa) using [Overture Maps](https://overturemaps.org/) data queried through [DuckDB](https://duckdb.org/) — no Google Maps or Nominatim required.

**Features**

- **Geocoding** — convert free-form addresses, place names, or categories into coordinates
- **Reverse geocoding** — find the nearest places to any latitude/longitude pair
- **Nearest place** — single closest match within a configurable radius
- **Place detail** — full Overture Maps record by place ID
- **Zero external dependencies at runtime** — DuckDB reads Overture Parquet files directly over HTTPS; no PostGIS, no Elasticsearch, no third-party API keys

---

## Documentation

Full API reference is available on the live demo site at `/docs`, or read the source in [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml).

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server status and cache info |
| `GET` | `/api/search` | Geocode by name, address, city, postcode, or category |
| `GET` | `/api/reverse` | Reverse geocode — places near a coordinate |
| `GET` | `/api/places/nearest` | Single closest place within a radius |
| `GET` | `/api/places/:id` | Full place detail by Overture place ID |

### Quick example

```bash
# Geocode by name
curl "https://geodataplacefinder.org/api/search?q=Eiffel+Tower"

# Reverse geocode
curl "https://geodataplacefinder.org/api/reverse?lat=48.8584&lon=2.2945"

# Nearest place within 500 m
curl "https://geodataplacefinder.org/api/places/nearest?lat=48.8584&lon=2.2945&max_distance_m=500"
```

---

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (recommended)
- Or: Node.js 20+ and pnpm 9+

### Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/geodataplacefinder.git
cd geodataplacefinder

# 2. Build and start both services
docker compose up --build
```

The API server is available at `http://localhost:8080` and the demo site at `http://localhost:3000`. The production deployment is at `https://geodataplacefinder.org`.

> **Note:** On first start DuckDB fetches ~50 000 place records from Overture Maps S3 (~15 s). Subsequent restarts load the local cache instantly from `data/places.duckdb`.

#### `Dockerfile` (API server)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/ ./lib/
RUN pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080
CMD ["node", "artifacts/api-server/dist/index.js"]
```

#### `docker-compose.yml`

```yaml
version: "3.9"
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
    volumes:
      - ./data:/app/data   # persist the DuckDB cache between restarts

  web:
    build:
      context: .
      dockerfile: artifacts/geodata-web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
    depends_on:
      - api
```

### Manual installation (without Docker)

```bash
# 1. Clone
git clone https://github.com/your-org/geodataplacefinder.git
cd geodataplacefinder

# 2. Install dependencies (requires Node.js 20+ and pnpm 9+)
pnpm install

# 3. Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 4. In a separate terminal, start the frontend (port 25276 by default)
pnpm --filter @workspace/geodata-web run dev
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | API server port |
| `SESSION_SECRET` | — | Secret used for session signing (set for production) |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## License

GeoDataPlacefinder is released under the **GNU General Public License v3.0**. See [LICENSE](LICENSE) for the full text.

Data sourced from [Overture Maps Foundation](https://overturemaps.org/), released under [CDLA Permissive 2.0](https://cdla.dev/permissive-2-0/).
