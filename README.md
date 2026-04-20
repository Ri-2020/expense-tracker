# Expense Tracker

**Live demo:** https://notesa--release-x60lprmh.web.app/

Full-stack personal expense tracker — Express + Firestore backend deployed as a Firebase Cloud Function, React/Vite frontend on Firebase Hosting. Supports Google sign-in, per-user expense isolation, category filtering, and spending summaries.

## Architecture

```
Firebase Hosting (preview channel: "release")
  ├── /expenses/**  →  Cloud Function: api  (Express, asia-south1)
  │                      └── Firestore  users/{uid}/expenses/{expenseId}
  │                                     users/{uid}/idempotency_keys/{key}
  └── **            →  React SPA (frontend/dist)
```

The hosting rewrite means the frontend calls `/expenses` as a same-origin relative path — no hardcoded function URL, no CORS configuration needed.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Node 20, Express 4 |
| Database | Firestore (Firebase Admin SDK) |
| Auth | Firebase Authentication (Google sign-in) |
| Hosting | Firebase Hosting (SPA + Function rewrite) |
| Runtime | Firebase Cloud Functions v2 (asia-south1) |
| Tests | Jest 29 + Supertest + Firestore Emulator |

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Create expense (idempotent via `Idempotency-Key` header) |
| GET | `/expenses?category=Food&sort=date_desc` | List expenses (filter + sort) |
| GET | `/expenses/summary` | Per-category spending totals |

All endpoints require `Authorization: Bearer <firebase-id-token>`.

Amounts are accepted and returned as 2-decimal strings (`"250.50"`); stored internally as integer paise.

Sort options: `date_desc` (default, newest first), `date_asc` (oldest first).

## Quick Start (local dev)

```bash
# Terminal 1 – backend
cd backend && npm install && npm start        # :3001

# Terminal 2 – frontend (proxies /expenses → :3001 via Vite)
cd frontend && npm install && npm run dev     # :5173
```

Copy `.env.example` to `frontend/.env` and fill in your Firebase project credentials.

Open http://localhost:5173

## Deploy

```bash
./deploy.sh
```

The script will:
1. Validate Node, npm, Firebase CLI, and Java (required for emulator)
2. Verify Firebase login
3. Install backend deps and run all 7 integration tests against the Firestore emulator (deploy aborts on test failure)
4. Reinstall backend deps in production mode (no devDependencies)
5. Build the frontend (`frontend/dist/`)
6. Deploy the Cloud Function to asia-south1
7. Deploy the frontend to the **`release` preview channel** — the live/default channel is never touched automatically

To promote a verified preview to live:

```bash
firebase hosting:clone notesa:release notesa:live
```

## Running Tests

Tests run against the Firestore emulator (requires Java):

```bash
# Easiest — emulator starts, tests run, emulator stops
firebase emulators:exec --only firestore "npm --prefix backend test"
```

Or run the emulator and tests in separate terminals:

```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
cd backend && npm test
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.js          Cloud Function entry point
│   │   ├── server.js         Express app setup
│   │   ├── db.js             Firestore singleton
│   │   ├── models/expense.js Business logic (CRUD, aggregation, paise conversion)
│   │   ├── routes/expenses.js REST endpoints
│   │   └── middleware/
│   │       ├── auth.js       Firebase ID token verification
│   │       └── validate.js   Request body validation
│   └── tests/expenses.test.js
├── frontend/
│   └── src/
│       ├── main.jsx          Entry point with AuthProvider
│       ├── App.jsx           Route: Login or Dashboard
│       ├── firebase.js       Firebase SDK init
│       ├── context/AuthContext.jsx
│       ├── hooks/useExpenses.js  Fetch + abort + reload logic
│       ├── api/expenses.js   HTTP client
│       └── components/
│           ├── Login.jsx
│           ├── ExpenseForm.jsx
│           ├── ExpenseList.jsx
│           ├── ExpenseFilters.jsx
│           └── CategorySummary.jsx
├── firebase.json
├── .firebaserc
└── deploy.sh
```

## Key Design Decisions

### Money handling
Amounts are stored as `INTEGER` paise (rupees × 100) in Firestore. This eliminates floating-point drift entirely — no rounding errors in sums or aggregations. The API converts at the boundary: accepts and returns a 2-decimal string (`"250.50"`).

### Idempotency
Each form mount generates a `crypto.randomUUID()` key. The key is sent as an `Idempotency-Key` header on every POST attempt. On the server a Firestore **transaction** atomically checks the `idempotency_keys` sub-collection and either creates the expense or returns the existing one — safe under concurrent retries with no unique-constraint hack required. The key rotates only on success, so retries on network failure reuse the same key safely.

### Authentication & data isolation
Firebase Google sign-in produces a short-lived ID token. Every API request carries it as `Authorization: Bearer <token>`; `requireAuth` middleware verifies it with `firebase-admin.auth().verifyIdToken()`. Expenses are stored under `users/{uid}/expenses` so each user's data is physically scoped to their UID in Firestore.

### Persistence: Firestore
- Serverless-compatible — no local file state, survives Cloud Function cold starts
- Admin SDK auto-authenticates via the function's service account in GCP; locally uses the emulator or `GOOGLE_APPLICATION_CREDENTIALS`
- Filtering and sorting done in-memory (suitable for a personal tracker; no composite Firestore indexes required)

### Frontend state
- `useExpenses` custom hook owns fetch/abort/reload; components are fully presentational
- `AbortController` cancels in-flight requests when filters change — prevents stale responses overwriting newer results
- `refreshToken` integer in Dashboard is bumped after a successful create; hooks depending on it re-fetch automatically

### Deployment safety
Frontend deploys to a **preview channel** (`release`), not the live channel. A human must run `firebase hosting:clone` to promote. This gives a verification window before any user-visible change goes live.

## Trade-offs

| Included | Skipped |
|---|---|
| Idempotency via header + Firestore transaction | Edit / delete expenses |
| Integer paise storage | Date range filtering |
| Per-user Firestore path isolation | Frontend component tests |
| Category filter + per-category summary | Optimistic UI updates |
| AbortController on filter change | Full currency formatting library |
| 7 integration tests with emulator | Automatic promotion to live |
| Firebase Hosting preview channel deploy | Multi-currency support |
