# CapTrack Quick Reference

## Current Status
- **Backend:** ✅ Complete (API, auth, WebSocket, tests)
- **Frontend:** ⏸️ Planned, awaiting approval
- **Next Step:** Manager approves Phase 2 plan

## Project Files (Quick Index)

| File | Purpose | Read Time |
|------|---------|-----------|
| PROJECT_STATUS.md | Current status, what's done, what's next | 2 min |
| MANAGER_SUMMARY.md | Overview for decision-makers | 5 min |
| PLAN.md | Master plan + 5 phases with details | 15 min |
| CLAUDE.md | Development guidelines (SOLID) | 10 min |
| ARCHITECTURE.md | Design patterns with examples | 15 min |
| INSTRUCTIONS.md | How to code, test, commit | 5 min |
| README.md | Setup and API documentation | 10 min |

## Code Structure

```
Backend: server/
├── src/
│   ├── auth/          OAuth, JWT, user provisioning
│   ├── routes/        HTTP endpoints (thin)
│   ├── services/      Business logic (testable)
│   ├── ws/            WebSocket server
│   ├── middleware/    Auth, validation, error handling
│   └── app.ts         Express app assembly
├── test/              Test files (auth, CRUD, isolation, WS)
└── prisma/            Database schema & migrations

Frontend: client/src/
├── pages/             Auth, Dashboard, Transactions, Categories
├── components/        Reusable UI components
├── hooks/             Data fetching and state (React Query)
├── api/               API client wrappers
├── ws/                WebSocket context + hooks
└── validation/        Zod schemas (forms)
```

## Core Rules (From CLAUDE.md)

1. **Single Responsibility:** One file, one reason to change
2. **Dependency Injection:** Pass deps as args, not hard-coded
3. **No HTTP in Services:** Services return plain objects
4. **Components are Dumb:** Props in, JSX out
5. **Hooks own Data:** useQuery, useMutation for server state

## Commit Checklist

- [ ] < 500 LOC (one feature)
- [ ] Tests pass (`npm run test -w server`)
- [ ] Manual test in browser (per PLAN.md)
- [ ] Clear commit message (why, not what)
- [ ] No hard-coded dependencies
- [ ] No console.log left behind

## Running the App

```bash
# Terminal 1: Start Postgres
npm run db:up

# Terminal 2: Start backend + frontend
npm run dev

# Browser
http://localhost:5173  # Frontend
http://localhost:3001  # Backend API
```

## Testing

```bash
# Backend tests
npm run test -w server

# Watch mode
npm run test:watch -w server

# Frontend: Manual in browser (for now)
```

## Key Decision Points

| Question | Answer |
|----------|--------|
| New OAuth provider? | Add class → implement interface → register in index.ts (strategy pattern) |
| New filter type? | Add to schema → update hook → wire to component (open/closed) |
| New alert type? | Add message type → add handler → add UI (sealed from modification) |
| Bug in component? | Check hook (data), check props (rendering), check API (response) |
| Slow query? | Check database indexes, add React Query staleTime, profile with DevTools |

## Common Tasks

```bash
# New database migration (after schema change)
npm run migrate:dev -w server

# Run specific test file
npm run test -w server auth.test.ts

# Debug backend
node --inspect --loader tsx ./src/index.ts
# Then: chrome://inspect

# Check what changed
git diff --stat

# See commit message
git log -1 -p
```

## Phase 2 Overview (Frontend Core - To Be Approved)

| Commit | What | Manual Test |
|--------|------|-------------|
| 1 | Base structure + entry point | `npm run dev` starts no errors |
| 2 | Router + AuthPage | See OAuth buttons at /login |
| 3 | API client + useMe hook | useMe() returns user post-login |
| 4 | ProtectedRoute + AppShell | Unauthed → /login, authed → AppShell |
| 5 | Global styles + theme | Consistent styling |
| 6 | Common UI components | Components render |
| 7 | Dashboard skeleton + full flow | Full OAuth flow works |

## Approval Needed

**Manager, please review and approve Phase 2 (PLAN.md, starting line "Phase 2 Detailed Plan").**

Options:
1. ✅ **Approve** → I start immediately
2. 📝 **Change** → I adjust, resubmit
3. 🔄 **Discuss** → Let's talk scope/timeline

**Awaiting your decision.**
