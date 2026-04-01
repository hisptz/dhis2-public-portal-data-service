# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **pnpm monorepo** for transferring DHIS2 metadata and data to a FlexiPortal platform. It contains:

- `apps/manager` — DHIS2 web app (React + DHIS2 App Platform) for managing sync configurations
- `packages/shared` — Shared Zod schemas/types used across apps and services
- `services/data-service` — Node.js/Bun backend with Express API + RabbitMQ worker

## Commands

### Root

```bash
pnpm clean        # Remove all node_modules recursively
pnpm lint         # ESLint across the monorepo (excludes apps/manager, has own config)
pnpm format       # Prettier write across all files
pnpm format:check # Prettier check across all files
pnpm typecheck    # tsc --noEmit in all workspaces
```

### Manager App (`apps/manager`)

```bash
pnpm start        # Dev server (d2-app-scripts start)
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # ESLint + Prettier check
pnpm format       # Prettier write
```

### Data Service (`services/data-service`)

```bash
pnpm dev          # Run API + worker concurrently (hot reload)
pnpm dev:api      # API server only (Bun watch)
pnpm dev:worker   # RabbitMQ worker only (Bun watch)
pnpm build        # Bundle with tsup → zip artifact
pnpm lint:check   # ESLint
pnpm format:check # Prettier check
pnpm check-types  # TypeScript typecheck (no emit)

# Prisma
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:migrate   # Run migrations (dev)
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:reset     # Reset DB + re-run migrations
```

### Environment Setup

Copy `services/data-service/.env.example` to `.env` and fill in:

- `DHIS2_BASE_URL`, `DHIS2_PAT` — source DHIS2 instance
- `RABBITMQ_URI` (or `RABBITMQ_HOST/USER/PASS`) — message queue
- `DATABASE_URL` — PostgreSQL connection
- `DATA_SERVICE_PORT` — defaults to 3000

## Architecture

### Data Flow

1. **Manager App** configures sync jobs via the data-service REST API
2. **Data Service API** (`src/app.ts`) receives requests, enqueues jobs via RabbitMQ
3. **Worker** (`src/rabbit/worker.ts`) consumes queue messages and runs migration handlers
4. **Handlers** use Prisma to track run state in PostgreSQL while calling DHIS2 APIs via Axios

### Data Service Internal Structure

- `src/clients/` — Prisma client, RabbitMQ connection, DHIS2 HTTP client
- `src/routes/` — Express routes: `data-download/`, `metadata-download/`, `failed-queue/`, `info/`
- `src/rabbit/` — Queue connection, worker loop, message handlers
- `src/services/` — Business logic for `data-migration/` and `metadata-migration/`
- `src/utils/` — Helpers for pagination, visualizations, dashboards, indicators, status tracking
- `src/env/` — Type-safe environment variable parsing
- `src/openapi/` — Swagger/OpenAPI spec generation
- `prisma/schema.prisma` — 6 models: `DataRun`, `DataDownload`, `DataUpload`, `MetadataRun`, `MetadataDownload`, `MetadataUpload`

### Shared Package

`packages/shared/src/schemas/data-service/` exports Zod schemas for config, status, summary, and run-config. Both the manager app and data service import from `shared`.

### Key Design Decisions

- The data service runs on **Bun** (not Node.js) for performance; use `bun` commands, not `node`/`ts-node`
- Build output uses `tsup` with path alias resolution via `tsc-alias`; entry points are scanned from `src/routes/**`
- RabbitMQ prefetch and connection config are tunable via env vars
- The Docker build uses **Turbo** for monorepo pruning before building the data-service image
