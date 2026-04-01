# DHIS2 Public Portal Data Service

Data service tool and DHIS2 application for data and metadata migration to a dedicated public portal DHIS2 instance.

Built by [HISP Tanzania](mailto:dev@hisptanzania.org).

## Overview

This monorepo provides tooling to extract data and metadata from a source DHIS2 instance and push it to a dedicated FlexiPortal DHIS2 public portal instance. It is composed of:

| Package                 | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `apps/manager`          | DHIS2 web application for managing and triggering migration runs |
| `services/data-service` | Backend API + worker service that performs the actual migration  |
| `packages/shared`       | Shared Zod schemas and TypeScript types                          |

## How It Works

The migration pipeline is queue-based:

1. The **Manager app** (installed inside DHIS2) lets users configure and trigger data/metadata migration runs.
2. Requests hit the **Data Service REST API**, which creates a run record in PostgreSQL and enqueues a job in RabbitMQ.
3. The **Worker** consumes queue messages and executes the migration:
    - **Metadata**: pulls visualizations, maps, and dashboards (plus their dependencies — data elements, indicators, category combos, legends, etc.) from the source instance, then uploads them to the portal.
    - **Data**: downloads data values for configured periods and org unit hierarchies, then uploads them to the portal using configurable strategies (`CREATE_AND_UPDATE` or `DELETE`).
4. Run status and download/upload summaries are persisted in PostgreSQL and exposed via the API.

The API is self-documented via Swagger UI at `/docs`.

## Prerequisites

- [Bun](https://bun.sh) — runtime for the data service
- [Node.js](https://nodejs.org) 20+ — for the manager app
- [pnpm](https://pnpm.io) 10+
- PostgreSQL
- RabbitMQ

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the data service

```bash
cp services/data-service/.env.example services/data-service/.env
```

| Variable                  | Description                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `DHIS2_BASE_URL`          | URL of the source DHIS2 instance                                                     |
| `DHIS2_PAT`               | Personal access token for the source DHIS2 instance                                  |
| `DATABASE_URL`            | PostgreSQL connection string                                                         |
| `RABBITMQ_URI`            | RabbitMQ connection URI (or use `RABBITMQ_HOST` / `RABBITMQ_USER` / `RABBITMQ_PASS`) |
| `RABBITMQ_PREFETCH_COUNT` | Number of queue messages processed concurrently                                      |
| `DATA_SERVICE_PORT`       | Port for the HTTP API (default: `3003`)                                              |

### 3. Run database migrations

```bash
cd services/data-service
pnpm prisma:migrate
```

### 4. Start the data service

```bash
# API + worker together (hot reload)
cd services/data-service
pnpm dev

# Or separately
pnpm dev:api
pnpm dev:worker
```

The API will be available at `http://localhost:3003` and Swagger docs at `http://localhost:3003/docs`.

### 5. Start the manager app

```bash
cd apps/manager
pnpm start
```

The app requires an active DHIS2 instance. Configure the proxy in `d2.config.js` to point to your DHIS2 instance.

## Development

### Useful commands

```bash
# Run from the repo root
pnpm typecheck          # TypeScript check across all workspaces
pnpm lint               # ESLint (data-service + packages)
pnpm format:check       # Prettier check across all files
pnpm format             # Prettier write across all files

# Data service
cd services/data-service
pnpm lint:check
pnpm check-types
pnpm prisma:studio      # Open Prisma Studio to inspect the database
pnpm prisma:reset       # Reset the database and re-run all migrations
pnpm build              # Produce a bundled .zip artifact

# Manager app
cd apps/manager
pnpm lint:check
pnpm typecheck
pnpm build
```

### Pre-commit hooks

Husky runs `lint-staged` on every commit — staged `.ts`/`.js` files are linted with ESLint and formatted with Prettier; JSON/YAML/Markdown files are formatted with Prettier.

### CI

GitHub Actions runs three parallel checks on every pull request and push to `main`:

| Job              | What it does                         |
| ---------------- | ------------------------------------ |
| **Type Check**   | `tsc --noEmit` across all workspaces |
| **Lint**         | ESLint across all workspaces         |
| **Format Check** | Prettier across the entire repo      |

## Project Structure

```
.
├── apps/
│   └── manager/                  # DHIS2 web app (React, DHIS2 App Platform)
├── packages/
│   └── shared/                   # Shared Zod schemas and types
└── services/
    └── data-service/
        ├── prisma/               # PostgreSQL schema and migrations
        └── src/
            ├── app.ts            # Express server entry point
            ├── clients/          # Prisma, RabbitMQ, DHIS2 HTTP clients
            ├── env/              # Type-safe environment config
            ├── openapi/          # Swagger/OpenAPI spec
            ├── rabbit/           # RabbitMQ connection, worker, message handlers
            ├── routes/           # Express API routes
            ├── services/         # Migration business logic
            └── utils/            # Pagination, analytics, status helpers
```
