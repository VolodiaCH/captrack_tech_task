# CapTrack Development Instructions

**For Developers (All Contributors):** Follow this workflow to maintain code quality and alignment.

---

## Core Workflow: Plan First, Code Second

### Before Writing Any Code

1. **Read the plan** (PLAN.md section for your phase)
2. **Create a detailed sub-plan** (if not already done)
3. **Get approval** from the manager/tech lead
4. **Only then** implement, test, and commit

**Why?** 
- Catches misalignments early (before hours of coding)
- Ensures small, reviewable commits
- Prevents rework and scope creep
- Keeps the codebase modular and extensible

---

## Workflow Per Commit

### Before Coding

```bash
# 1. Read the plan for your phase
cat PLAN.md  # Find your phase section

# 2. Discuss with manager
# "I'm about to work on Phase 2 Commit 1: Base Folder Structure"
# Manager reviews plan, approves or suggests changes

# 3. Make sure branch is clean
git status  # Should be clean
```

### During Coding

```bash
# 1. Make changes for ONE commit (one feature, one concern)
# Follow CLAUDE.md guidelines:
#   - Single responsibility
#   - DI instead of hard-coded dependencies
#   - Services have no HTTP knowledge
#   - Components are dumb UI

# 2. Test locally (write new tests for new code)
npm run test -w server    # Backend tests
npm run dev               # Start server + client, test manually

# 3. Verify in browser (manual QA per commit plan)
# Check PLAN.md "Test:" section for this commit

# 4. Review your own changes
git diff --stat           # What changed?
git diff                  # Does it look good?
```

### Committing

```bash
# 1. Stage only the files for THIS commit
git add src/myfeature.ts test/myfeature.test.ts

# 2. Write a clear commit message
#    Format: "Imperative present tense + why"
#    Example: "Add transaction form validation
#             - Validates title, amount, currency
#             - Shows inline errors
#             - Mirrors backend schema"
git commit -m "Your commit message"

# 3. Verify commit looks good
git log -1 -p

# 4. If only backend: run tests once more
npm run test -w server
```

### After Committing

```bash
# 1. Run full test suite (if backend changed)
npm run test -w server

# 2. If frontend: test in browser once more
# (Manual testing is the real verification)

# 3. Ready for next commit
# Go back to "Before Coding" for next commit in the phase
```

---

## Commit Size Guidelines

**Small commits = easier to review + easier to revert if needed**

| Change Type | Ideal Size | LOC Limit | Examples |
|---|---|---|---|
| Single component | < 50 lines | < 80 | Button.tsx, Input.tsx |
| Single service function | < 30 lines | < 50 | getUserBudget() |
| Route endpoint | < 40 lines | < 60 | GET /api/transactions |
| Test file | < 50 lines per test | 1 test = 1 behavior | auth.test.ts |
| Style/config | < 100 lines | < 150 | global.css |

**If a file exceeds limits: split into a separate commit.**

---

## Testing Requirements

### Backend (Node.js/TypeScript)

```bash
# Every backend commit must pass tests
npm run test -w server

# Tests MUST cover:
# 1. Happy path (normal operation)
# 2. Error path (validation, not found, unauthorized)
# 3. User isolation (cross-user access denied)
```

**Example:**
```typescript
it('should create a transaction for the authenticated user', async () => {
  const { user, token } = await loginAs(app, 'google');
  const category = await createCategory(user.id);
  
  const res = await supertest(app)
    .post('/api/transactions')
    .set('Cookie', `captrack_session=${token}`)
    .send({ title: 'Groceries', amount: 50, currency: 'USD', date: new Date(), categoryId: category.id });
  
  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Groceries');
});

it('should not allow user B to create transaction in user A's category', async () => {
  const { user: userA } = await loginAs(app, 'google', { providerUserId: 'a' });
  const { user: userB, token: tokenB } = await loginAs(app, 'google', { providerUserId: 'b' });
  const catA = await createCategory(userA.id);
  
  const res = await supertest(app)
    .post('/api/transactions')
    .set('Cookie', `captrack_session=${tokenB}`)
    .send({ title: 'Hack', amount: 1000, currency: 'USD', date: new Date(), categoryId: catA.id });
  
  expect(res.status).toBe(404); // Not 403 (don't leak existence)
});
```

### Frontend (React/TypeScript)

```bash
# Manual testing in browser (for now)
# Follow "Test:" section in PLAN.md for each commit

# Example (Phase 2 Commit 2: Router + AuthPage):
# 1. npm run dev
# 2. Open http://localhost:5173/login
# 3. See two OAuth buttons
# 4. Click Google → redirected to OAuth (or fake login in test)
# 5. Redirected back to dashboard
# 6. Check browser console for errors → should be clean
```

---

## Common Tasks

### Running the App

```bash
# Terminal 1: Start Postgres
npm run db:up

# Terminal 2: Start backend + frontend (concurrently)
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api/*
# WebSocket: ws://localhost:3001/ws
```

### Running Tests

```bash
# Backend tests only
npm run test -w server

# Watch mode (reruns on change)
npm run test:watch -w server

# Frontend tests (not yet implemented)
# npm run test -w client
```

### Database Migrations

```bash
# After editing schema, create migration
npm run migrate:dev -w server

# Or deploy existing migrations
npm run migrate -w server

# Reset test database (rarely needed)
rm -rf pgdata  # Local Docker volume
npm run db:down
npm run db:up
```

### Debugging

```bash
# Backend: Use Node debugger
node --inspect --loader tsx ./src/index.ts
# Then open chrome://inspect

# Frontend: Use browser DevTools (F12)
# Check Network tab for API calls
# Check Application tab for cookies
# Check Console for errors

# WebSocket: Monitor in DevTools
# Open Network tab, filter by WS
# Click on ws://localhost:3001/ws
# See messages in-stream
```

---

## Code Review Checklist

Before asking for approval of a commit, ask yourself:

- [ ] **Single Responsibility:** Does this file have one reason to change?
- [ ] **Dependency Injection:** Could I test this without HTTP/DB calls?
- [ ] **No Hard-Coded Deps:** Are dependencies passed as arguments or hooked?
- [ ] **Tests Pass:** `npm run test -w server` returns 0 failures?
- [ ] **Manual Test Done:** Did I verify in the browser per PLAN.md?
- [ ] **No Console Errors:** Did I check the browser/server console?
- [ ] **Commit Size:** Is this < 500 LOC and one feature?
- [ ] **Message Clear:** Can someone understand the commit from the message alone?
- [ ] **No Breaking Changes:** Did I modify an existing API/function signature?

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `vitest` not found | Run `npm install` in server/ or root |
| Port 3001 already in use | Kill the process: `lsof -ti:3001 \| xargs kill -9` (macOS/Linux) or Task Manager (Windows) |
| Postgres not starting | Check Docker is running, `npm run db:up`, check `docker ps` |
| Tests timeout | Increase timeout in vitest.config.ts or individual test |
| OAuth callback fails | Ensure `OAUTH_REDIRECT_BASE_URL` and `CLIENT_ORIGIN` in `.env` match your setup |
| WebSocket won't connect | Check DevTools Network tab, verify JWT cookie is present |
| Transaction doesn't appear in list | Ensure category belongs to same user, check transaction date is today/this month |

---

## Phase Progression

```
Phase 2 (Frontend Core) → Manager Approval
    ↓
Phase 2 Implementation (7 commits)
    ↓
All Phase 2 tests pass + Manual verification
    ↓
Phase 3 (CRUD Features) → Manager Approval
    ↓
...
```

**At each phase boundary, pause and get approval before proceeding.**

---

## Questions?

Refer to:
1. **PLAN.md** - What are we building and why?
2. **CLAUDE.md** - How should code be organized?
3. **ARCHITECTURE.md** - What patterns should I use?
4. **README.md** - How do I run the app?

**If still stuck:** Discuss with manager before making assumptions.
