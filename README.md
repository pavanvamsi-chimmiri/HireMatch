# HireMatch

HireMatch matches candidates to open roles by scoring skill overlap, experience
and location/remote fit. It is a small full-stack TypeScript app:

- **`server/`** – Express + TypeScript REST API backed by SQLite (`better-sqlite3`),
  seeded with sample jobs and candidates on first run.
- **`client/`** – React + Vite single-page app that browses roles and shows ranked,
  explainable candidate matches.

## Prerequisites

- Node.js 20+ (the repo is developed on Node 22)
- npm 10+

## Getting started

```bash
npm install        # install all workspace dependencies
npm run dev        # run API (:4000) and web client (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` to the API
on port 4000, so no extra configuration is required.

### Run the pieces individually

```bash
npm run dev:server   # API only, http://localhost:4000
npm run dev:client   # web client only, http://localhost:5173
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Service health check |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs/:id/matches` | Ranked candidates for a job |
| GET | `/api/candidates` | List candidates |
| POST | `/api/candidates` | Create a candidate |
| GET | `/api/candidates/:id/matches` | Ranked jobs for a candidate |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API + client together |
| `npm run build` | Type-check and build both workspaces |
| `npm run typecheck` | Type-check both workspaces |
| `npm test` | Run the API unit tests (Vitest) |

## Matching model

Each candidate is scored against a job on a 0–100 scale that blends:

- **Skills (60%)** – fraction of the job's required skills the candidate has (case-insensitive).
- **Experience (25%)** – candidate years vs. the role's minimum.
- **Location (15%)** – full credit for remote-friendly matches or same city, otherwise a penalty.
