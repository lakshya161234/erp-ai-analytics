# ERP AI Analytics PoC

A lightweight proof-of-concept that demonstrates an AI assistant answering ERP analytics questions by:
1) interpreting a user question,
2) running safe, pre-defined SQL analytics tools against a Postgres database,
3) returning a structured response powered by the Gemini API.

## Repo structure

- `apps/api` — Express API (Gemini + Postgres tools)
- `apps/web` — Optional Next.js UI (simple chat + data panel)
- `db` — schema + seed SQL for a demo database
- `docs` — demo script, API reference, security notes

## Quick start (API)

```bash
cd apps/api
cp .env.example .env
npm install
npm run dev
```

API health check: `GET http://localhost:8080/health`

## Database

1) Create a Postgres database (local, Neon, etc.)
2) Run:

```bash
psql "$DATABASE_URL" -f ../../db/schema.sql
psql "$DATABASE_URL" -f ../../db/seed.sql
```

## Quick start (Web - optional)

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Example questions to demo

- "What was last month's most sold product?"
- "Show revenue for the last 30 days."
- "Top 5 clients by revenue this quarter."
- "How many orders were placed last week?"

> Note: This PoC is intentionally tool-restricted: the model can only query via registered tools.
