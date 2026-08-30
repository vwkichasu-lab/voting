# Backend - Node.js / Express API

REST API for the voting system, implemented per [`../docs/API.md`](../docs/API.md).

## Stack

- Node.js + Express
- JSON-file data store (`data/db.json`, auto-created and seeded)
- Bearer-token auth (student sessions + admin tokens)

## Setup

```bash
npm install
npm run seed -- --force   # populate demo data
npm start                 # http://localhost:8000 (PORT env to override)
```

## Scripts

- `npm start` — run the API server
- `npm run dev` — run with auto-restart (`node --watch`)
- `npm run seed` — (re)create demo data (`--force` to overwrite)

## Key endpoints

See [`../docs/API.md`](../docs/API.md) for the full contract.

- `POST /api/auth/request-code` / `POST /api/auth/verify-code`
- `GET  /api/election/status` / `GET /api/election/ballot` / `POST /api/election/vote`
- `POST /api/admin/login` + protected `/api/admin/*` (dashboard, elections, candidates, voters, results, audit logs)

## Testing

Run the server and exercise the API (e.g. with the frontend or `curl`/`Invoke-RestMethod`).

