# CapTrack - Run Locally

Complete instructions to run CapTrack frontend + backend locally.

---

## Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **Docker & Docker Compose** ([download](https://www.docker.com/products/docker-desktop/))
- **Git** (already installed if you're reading this)

**Verify installations:**
```bash
node --version      # Should be v20+
npm --version       # Should be 10+
docker --version    # Should be present
docker-compose --version  # Should be present
```

---

## Quick Start (5 minutes)

### Step 1: Start PostgreSQL

```bash
npm run db:up
```

This starts a Docker container running PostgreSQL. Verify it's running:

```bash
docker ps | grep captrack-db
```

Should show a running container named `captrack-db`.

### Step 2: Copy Environment File

```bash
cp .env.example .env
```

**Edit `.env` and fill in OAuth credentials:**

```env
# These are already set (leave as-is for local dev):
# Note: port 5433, not 5432 - the Docker Postgres container is mapped to 5433
# to avoid clashing with a native Postgres install that many machines already
# have running on the default 5432. If nothing is listening on 5432 on your
# machine, you can use it instead - just also update it in docker-compose.yml.
DATABASE_URL=postgresql://captrack:captrack@localhost:5433/captrack
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
COOKIE_NAME=captrack_session
OAUTH_REDIRECT_BASE_URL=http://localhost:3001
CLIENT_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001

# TODO: Fill these with your OAuth app credentials:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**See "OAuth Setup" section below for how to get these credentials.**

### Step 3: Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo (server + client).

### Step 4: Run Migrations

```bash
npm run db:migrate
```

This creates the database schema.

### Step 5: Start Backend + Frontend

```bash
npm run dev
```

This starts both backend and frontend concurrently:

- **Backend:** http://localhost:3001 (Express API + WebSocket)
- **Frontend:** http://localhost:5173 (React + Vite)

You should see:
```
[1] > captrack-server@0.1.0 dev
[1] Server running on http://localhost:3001
[2] > captrack-client@0.1.0 dev
[2] VITE v5.3.5  ready in 123 ms
[2] ➜  local:   http://localhost:5173/
```

### Step 6: Open in Browser

Open **http://localhost:5173** in your browser.

You should see:
- CapTrack logo
- Two OAuth buttons: "Continue with Google" and "Continue with GitHub"

---

## OAuth Setup

To use real OAuth (instead of test mode), you need to create OAuth apps:

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized JavaScript origins:
   ```
   http://localhost:3001
   http://localhost:5173
   ```
7. Add authorized redirect URIs:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
8. Copy **Client ID** and **Client Secret** into `.env`

### GitHub OAuth

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** CapTrack Local
   - **Homepage URL:** http://localhost:5173
   - **Authorization callback URL:** http://localhost:3001/api/auth/callback/github
4. Copy **Client ID** and **Client Secret** into `.env`

### Update .env

After creating OAuth apps, update your `.env`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-secret
GITHUB_CLIENT_ID=your-actual-client-id
GITHUB_CLIENT_SECRET=your-actual-secret
```

Then restart the dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## Testing the OAuth Flow

1. Open http://localhost:5173/login
2. Click **"Continue with Google"** (or GitHub)
3. Complete the OAuth flow
4. You should be redirected to the Dashboard
5. See your user name in the top-right corner
6. Click **Logout** to clear the session
7. You should be redirected to the login page

**If you get errors:**
- Check browser console (F12 → Console tab)
- Check backend logs (terminal where you ran `npm run dev`)
- Verify `.env` has correct OAuth credentials
- Verify redirect URIs match exactly (case-sensitive)

---

## Running Tests

### Backend Tests

```bash
npm run test -w server
```

Runs all backend tests (auth, categories, transactions, isolation, budgets, WebSocket alerts).

Should see:
```
✓ auth.test.ts (auth flow, user provisioning)
✓ categories.test.ts (CRUD, deletion reassignment)
✓ transactions.test.ts (CRUD, validation, filtering)
✓ isolation.test.ts (cross-user access denied)
✓ budgets.test.ts (calculations, currency)
✓ ws-alerts.test.ts (threshold alerts, once-per-month)

PASS  6 passed (in X.XXs)
```

### Running E2E Tests

```bash
npm run test:e2e
```

This runs the Playwright E2E test suite:
- Auth flow tests (login, protected routes, logout)
- Category CRUD tests
- Transaction CRUD and filtering tests
- Budget alert tests
- Cross-user isolation tests

**Prerequisites:**
- Database must be running: `npm run db:up`
- Make sure DATABASE_URL_E2E is set in `.env` (defaults to `postgresql://captrack:captrack@localhost:5433/captrack_e2e`)
- Dev server is started automatically by Playwright (`npm run dev`)

The test suite will:
1. Run migrations on the `captrack_e2e` database
2. Truncate all tables to clean state
3. Run all E2E tests in sequence
4. Generate an HTML report in `playwright-report/`

To open the report after tests finish:
```bash
npx playwright show-report
```

---

## Testing Real-Time Alerts

This section verifies that WebSocket budget threshold alerts work correctly.

### Prerequisites

- Backend and frontend running (`npm run dev`)
- Logged in to CapTrack at http://localhost:5173
- Open DevTools (F12) → Network tab → filter by "WS" to see WebSocket connection

### Basic Alert Test

1. **Verify WebSocket connection:**
   - Refresh the page
   - In DevTools Network tab, you should see a WebSocket connection to `/ws` (status "101 Switching Protocols")
   - If you don't see it, check backend logs for connection errors

2. **Create a budget:**
   - Go to Dashboard
   - Click "No budget set" (or "Create Budget" button)
   - Enter $100 as the budget amount
   - Click "Create Budget"
   - You should see the budget card with 0% usage

3. **Add transactions and watch alerts fire:**
   - Go to Transactions page
   - Create a transaction for $50
     - Dashboard should update to 50% usage (no alert yet)
   - Create another transaction for $30
     - Dashboard should update to 80% usage
     - You should see a toast notification at bottom-right: "📊 Spending at 80% — 80.00 / 100.00"
     - Toast auto-dismisses after 5 seconds OR you can click the X to dismiss
   - Create another transaction for $20
     - Dashboard should update to 100% usage
     - You should see toast: "📊 Spending at 100% — 100.00 / 100.00"
     - You should also see a persistent red banner at the top: "⚠️ Budget limit reached: 100.00 / 100.00. Dismiss to acknowledge."

4. **Test "fires once per month":**
   - Delete the $20 transaction
     - Dashboard should update to 80% usage
     - The top banner should disappear (not a 100% alert anymore)
     - No new 80% toast should appear (you already saw it)
   - Create the $20 transaction again
     - Dashboard should update to 100% usage
     - No new 100% toast should appear (same month, same threshold, already fired)
     - The top banner should NOT reappear (same reason)

5. **Test "replay on reconnect":**
   - While the banner is still showing, click "Dismiss"
     - Banner disappears
     - A message is sent to backend to mark alert as acknowledged
   - Refresh the page (Ctrl+R)
     - WebSocket reconnects
     - Unacknowledged 100% alert replays, banner reappears
   - Click "Dismiss" again
     - Banner disappears
     - You can now close DevTools

### Multi-Month Test

6. **Test month isolation:**
   - On Dashboard, click "Next →" to go to next month
     - Budget should show "No budget set for [next month]"
     - Alerts from previous month should be gone
   - Create a new budget for this month (e.g., $200)
   - Add a $180 transaction
     - Toast should fire: "📊 Spending at 80% — 180.00 / 200.00"
   - Go back to previous month (click "← Previous")
     - Dashboard should show the previous month's 100% banner should NOT appear
     - Alerts stay isolated by month

### Multi-User Test (Optional)

7. **Test data isolation:**
   - Open another browser window (Ctrl+N or Cmd+N)
   - Log in as a different user (use a different OAuth account)
   - Go to their Dashboard
   - Create a different budget (e.g., $50)
   - In Window 1, you should still see your $100 budget
   - In Window 2, you should see their $50 budget
   - Create a $40 transaction in Window 2
     - You should see a toast in Window 2 only
     - Window 1 should not show any alert
   - This confirms alerts are per-user and not broadcast globally

---

## Troubleshooting

### "Port 3001 already in use"

Kill the process using port 3001:

```bash
# macOS/Linux:
lsof -ti:3001 | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Cannot connect to PostgreSQL"

Check if Docker container is running:

```bash
docker ps | grep captrack-db
```

If not running, start it:
```bash
npm run db:up
```

### "Authentication failed against database server" / "P1000"

This usually means something *other* than our Docker container is already
listening on the port `DATABASE_URL` points to (commonly a native Postgres
install occupying 5432). Check what's bound to the port:

```bash
# Windows:
netstat -ano | findstr :5433
tasklist /FI "PID eq <PID from above>"

# macOS/Linux:
lsof -i :5433
```

If it's not our `captrack-db` container, either stop the conflicting service
or change the host port in `docker-compose.yml` and `DATABASE_URL`/`DATABASE_URL_TEST`
in `.env` to something free (this repo defaults to 5433 for exactly this reason).

### "prisma migrate deploy" fails with "Environment variable not found: DATABASE_URL"

Prisma's CLI and Vite each only auto-load a `.env` file sitting in their own
directory, not the monorepo root. This repo works around that by:
- `server/package.json` scripts wrapping every Prisma/Node command with
  `dotenv -e ../.env --` (loads the root `.env` explicitly)
- `client/vite.config.ts` setting `envDir: "../"` (points Vite at the root `.env`)

If you see this error, make sure you're running commands via the `npm run`
scripts (which include the `dotenv -e ../.env --` prefix) rather than calling
`prisma` or `vite` directly.

### "VITE_API_BASE_URL not set"

The `.env` file in `client/` should have:
```env
VITE_API_BASE_URL=http://localhost:3001
```

Restart dev server if you just added it.

### "OAuth redirect fails"

1. Check redirect URIs in your OAuth app match exactly:
   - Google: `http://localhost:3001/api/auth/callback/google`
   - GitHub: `http://localhost:3001/api/auth/callback/github`

2. Check `.env` has correct Client ID and Secret

3. Clear browser cookies/cache (F12 → Application → Storage → Clear Site Data)

### "Can't log in, 401 error"

1. Check backend is running (http://localhost:3001/api/auth/me should respond)
2. Check JWT_SECRET in `.env` is set
3. Check COOKIE_NAME in `.env` is "captrack_session"
4. Clear browser cookies and try again

---

## Commands Reference

```bash
# Start/stop database
npm run db:up          # Start PostgreSQL
npm run db:down        # Stop PostgreSQL

# Development
npm run dev            # Start backend + frontend (concurrently)
npm run dev -w server  # Start backend only
npm run dev -w client  # Start frontend only

# Database
npm run db:migrate     # Run Prisma migrations
npm run migrate:dev -w server  # Interactive migration creation

# Testing
npm run test -w server          # Run backend tests once
npm run test:watch -w server    # Run backend tests in watch mode

# Build
npm run build          # Build both backend and frontend
npm run build -w server
npm run build -w client

# Cleanup
npm run db:down        # Stop and remove database
docker system prune    # Clean up Docker (use with caution)
```

---

## What's Running

When you run `npm run dev`, you get:

### Backend (Port 3001)
- Express server with REST API
- WebSocket server for real-time alerts
- PostgreSQL connection
- OAuth2 endpoints

### Frontend (Port 5173)
- React app with Vite dev server
- Hot module replacement (changes reload instantly)
- Proxied API calls to http://localhost:3001

### Database
- PostgreSQL in Docker on port 5433 (mapped from container's internal 5432)
- Database: `captrack`
- User: `captrack`
- Password: `captrack`

---

## Next Steps

After running locally:

1. **Test the OAuth flow** (click login buttons)
2. **Check console for errors** (Ctrl+Shift+J)
3. **Run tests** (`npm run test -w server`)
4. **Read PLAN.md** for Phase 3 features
5. **Report any issues** with setup

---

## Need Help?

1. Check error messages in browser console (F12)
2. Check backend logs in terminal
3. Verify `.env` file has all required values
4. Verify ports 3001 (backend) and 5173 (frontend) are free
5. Verify Docker is running

---

**Happy developing! 🚀**
