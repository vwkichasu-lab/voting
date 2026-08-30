# Level 200 Combined Class Election Voting System

A secure, web-based voting system for the combined January and September Level 200 class election.

> **Implementation note:** The repository originally contained only specifications
> (see `docs/`). This implementation provides a complete, runnable application:
> a **Node.js/Express** backend (faithful to `docs/API.md`) and a **React 18**
> frontend. The backend uses a JSON-file data store by default (no external
> database required) so the whole system runs locally with just Node and npm.

## Project Structure

```
voting/
├── backend/              # Node.js/Express API (src/, data/)
├── frontend/             # React + Vite application (src/)
├── database/             # Database schema documentation (SCHEMA.md)
├── docs/                 # API, Architecture, Security, Development specs
├── docker-compose.yml    # Docker services configuration
├── .env.example          # Environment variables template
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Run locally

**1. Backend** (terminal 1):
```bash
cd backend
npm install
npm run seed -- --force     # create demo data (admin + 320 students + candidates)
npm start                   # serves http://localhost:8000 (set PORT to override)
```

**2. Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev                 # serves http://localhost:3000
```

**3. Open the app:**
- Student interface: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- Backend API: http://localhost:8000/api

> If port `8000` (or `8080`) is busy on your machine, start the backend with
> `PORT=8090 npm start` and the frontend with
> `VITE_API_TARGET=http://localhost:8090 npm run dev`.

### Demo credentials

- **Admin:** `admin@level200.local` / `Admin@123456`
- **Student OTP:** when you request a code, the 6-digit `dev_otp` is returned in
  the response for demo convenience (only when `NODE_ENV !== production`). In
  production the code is delivered to the student's registered contact only.

## Key Features

- ✅ Secure student authentication with OTP (6-digit, 5-min expiry, max attempts)
- ✅ One-time verification codes + rate limiting
- ✅ Duplicate vote prevention (transaction-style, locked per student)
- ✅ Ballot privacy (student identity separated from ballot)
- ✅ Admin dashboard with live participation stats
- ✅ Real-time voting control (open / pause / resume / close / publish)
- ✅ Comprehensive audit logs
- ✅ Result generation, tallying, winner calculation, CSV export
- ✅ Candidate & voter (CSV) management
- ✅ Mobile-responsive design

## Technology Stack

- **Backend:** Node.js + Express (RESTful API per `docs/API.md`)
- **Frontend:** React 18 + React Router + Vite + Axios
- **Data store:** JSON file (`backend/data/db.json`) by default; the schema in
  `database/SCHEMA.md` maps 1:1 to the in-memory models
- **Authentication:** Bearer token sessions (student) + admin tokens (OTP-ish)
- **API contract:** implemented exactly as specified in `docs/API.md`

## Security

This system implements:
- HTTPS enforcement
- CSRF protection
- SQL injection prevention
- XSS protection
- Rate limiting
- Session management
- Database constraints
- Transaction handling
- Audit logging

## Documentation

See [docs/](docs/) for detailed documentation:
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Specification](docs/API.md)
- [Security Guidelines](docs/SECURITY.md)
- [Development Guide](docs/DEVELOPMENT.md)

## License

Confidential - Level 200 Class Election
