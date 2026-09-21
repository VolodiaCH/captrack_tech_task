# CapTrack — Personal Expense Tracker MVP

A multi-user personal expense tracker with real-time WebSocket budget alerts, built with Node.js, React, PostgreSQL, and Prisma.

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose

### Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL:**
   ```bash
   npm run db:up
   ```

3. **Copy and configure environment:**
   ```bash
   cp .env.example .env
   # Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start dev server & client:**
   ```bash
   npm run dev
   ```

   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173

### Tests
```bash
npm run test              # Run all server tests once
npm run test:watch       # Watch mode
```

---

## Architecture

### Tech Stack
- **Backend:** Node.js + TypeScript + Express
- **Frontend:** React + Vite + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** WebSocket (`ws` library)
- **Auth:** OAuth2 (Google/GitHub)
- **Testing:** Vitest + Supertest

### Key Features
- **Multi-user with strict data isolation:** Each user sees only their own categories, transactions, and budgets.
- **SSO-only auth:** Google & GitHub OAuth with auto-provisioning on first login.
- **Categories:** Create, rename, delete with automatic reassignment of transactions to an "Uncategorized" category.
- **Transactions:** Full CRUD with currency tracking, search, and filtering.
- **Monthly budgets:** Track spending, compute usage %, and trigger alerts at 50%, 80%, and 100%.
- **Real-time alerts:** WebSocket notifications that fire once per month, even if spending fluctuates.

---

## API Routes

### Authentication
| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/google` | Initiate Google OAuth flow |
| GET | `/api/auth/github` | Initiate GitHub OAuth flow |
| GET | `/api/auth/callback/google` | Google OAuth callback |
| GET | `/api/auth/callback/github` | GitHub OAuth callback |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current authenticated user |

### Categories
| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List all categories for current user |
| POST | `/api/categories` | Create a new category |
| PATCH | `/api/categories/:id` | Rename category (cannot rename "Uncategorized") |
| DELETE | `/api/categories/:id` | Delete category, reassign transactions to "Uncategorized" |

### Transactions
| Method | Path | Description |
|---|---|---|
| GET | `/api/transactions` | List transactions with filters (search, category, date range, amount range) |
| POST | `/api/transactions` | Create a new transaction |
| GET | `/api/transactions/:id` | Get a specific transaction |
| PUT | `/api/transactions/:id` | Update transaction (all fields) |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Budgets
| Method | Path | Description |
|---|---|---|
| GET | `/api/budgets/:yearMonth` | Get budget & spending for a month (format: "2026-09") |
| PUT | `/api/budgets/:yearMonth` | Set/update monthly budget |

---

## WebSocket Protocol

### Connection
- Path: `/ws`
- Authentication: JWT cookie (httpOnly, same as REST)
- Rejection: Invalid/missing JWT returns HTTP 401 and closes socket

### Client → Server Messages

#### Subscribe to a month
```json
{"type": "subscribe", "yearMonth": "2026-09"}
```

#### Acknowledge an alert
```json
{"type": "acknowledge_alert", "yearMonth": "2026-09", "threshold": 80}
```

### Server → Client Messages

#### Budget status update
```json
{
  "type": "budget_status",
  "yearMonth": "2026-09",
  "hasBudget": true,
  "budget": 500,
  "spent": 320,
  "remaining": 180,
  "usagePct": 64
}
```

#### Threshold alert
```json
{
  "type": "threshold_alert",
  "yearMonth": "2026-09",
  "threshold": 80,
  "spent": 420,
  "budget": 500,
  "usagePct": 84,
  "firedAt": "2026-09-21T10:00:00Z",
  "replay": false
}
```
- `replay: true` = re-sent unacknowledged alert (e.g., on reconnect); client should not pop a new toast.
- `replay: false` = newly fired alert; show toast + add to persistent banner.

---

## Category Deletion Policy

When a category is deleted:
1. **Reassignment:** All transactions in that category are automatically moved to the "Uncategorized" category.
2. **Default category:** Each user has a protected "Uncategorized" category that cannot be renamed or deleted.
3. **Behavior:** Attempting to delete "Uncategorized" returns a 400 error.

---

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application type)
5. Set authorized JavaScript origins: `http://localhost:3001`
6. Set authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`
7. Copy Client ID and Client Secret into `.env`

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3001/api/auth/callback/github`
4. Copy Client ID and Client Secret into `.env`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_URL_TEST` | Yes | PostgreSQL test database URL |
| `PORT` | No | Backend server port (default: 3001) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `COOKIE_NAME` | No | Session cookie name (default: captrack_session) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth client secret |
| `OAUTH_REDIRECT_BASE_URL` | Yes | Base URL for OAuth callbacks |
| `VITE_API_BASE_URL` | Yes | Frontend API base URL |
| `CLIENT_ORIGIN` | Yes | Frontend origin (for CORS) |

---

## Testing

### Run All Tests
```bash
npm run test -w server
```

### Test Coverage
- **auth.test.ts:** OAuth login flow, user provisioning, session persistence
- **categories.test.ts:** CRUD operations, unique constraints, deletion policy
- **transactions.test.ts:** Transaction creation/editing, validation, filtering
- **isolation.test.ts:** Cross-user authorization checks
- **budgets.test.ts:** Budget calculations, spending tracking
- **ws-alerts.test.ts:** WebSocket threshold alerts (50%, 80%, 100%), once-per-month firing

### Notes
- All tests use a real PostgreSQL database (`captrack_test`)
- No mocked HTTP calls — OAuth providers are stubbed via dependency injection
- Tests are isolated: tables are truncated between test runs

---

## Directory Structure

```
captrack/
├── server/                    # Express backend
│   ├── src/
│   │   ├── auth/             # OAuth & JWT logic
│   │   ├── routes/           # HTTP endpoints
│   │   ├── services/         # Business logic
│   │   ├── ws/               # WebSocket server & handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── config/           # Environment & configuration
│   │   ├── prisma/           # Prisma client
│   │   └── utils/            # Helpers
│   ├── test/                 # Integration tests
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── migrations/       # Database migrations
│   ├── vitest.config.ts
│   └── package.json
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── api/              # API client
│   │   ├── hooks/            # Custom React hooks
│   │   ├── ws/               # WebSocket client logic
│   │   ├── validation/       # Form schemas
│   │   ├── styles/           # CSS
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── package.json              # Root workspace config
├── docker-compose.yml        # PostgreSQL setup
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## Development Notes

### Currency Handling
- Transactions can be in any currency (ISO 4217 code).
- Budget math only sums transactions matching the budget's currency.
- Other-currency transactions are displayed but flagged as excluded from monthly totals.

### WebSocket Alerts
- Alerts fire **once per month** for each threshold (50%, 80%, 100%).
- Thresholds fire independently: you can have 50% and 100% alerts but not 80%.
- If spending drops below a threshold after firing, the alert is **not retracted**.
- Alerts are disabled if no monthly budget is set.

### Session Management
- Sessions are stored as httpOnly, secure cookies (in production, with SameSite & Secure flags).
- JWT tokens expire after 7 days.
- Refresh tokens are not implemented — users are re-authenticated on page reload via the cookie.

---

## License

MIT
