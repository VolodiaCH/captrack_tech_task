# CapTrack Development Master Plan

**Project:** Personal Expense Tracker MVP with real-time budget alerts  
**Status:** Backend complete, Frontend in planning phase  
**Last Updated:** 2026-09-21

---

## Overall Vision

CapTrack is a multi-user expense tracker that allows users to:
1. Authenticate via Google or GitHub OAuth
2. Create and manage expense categories
3. Log transactions with search/filtering
4. Set monthly budgets and track spending
5. Receive real-time WebSocket alerts when spending crosses 50%, 80%, 100% thresholds

**Key Constraint:** Zero cross-user data leakage, strict user isolation at every layer.

---

## Phase Summary (High Level)

| Phase | Status | Commits | Tests | Duration |
|-------|--------|---------|-------|----------|
| **Phase 0** | ✅ Complete | 1 | ✅ 6 test files | Backend setup |
| **Phase 1** | 📋 Planning | - | - | Architecture docs |
| **Phase 2** | 🚀 Next | 5-7 small | Each step | Frontend core |
| **Phase 3** | 🚀 Next | 5-7 small | Each step | CRUD features |
| **Phase 4** | 🚀 Next | 3-5 small | Each step | WS + alerts |
| **Phase 5** | 🚀 Next | 2-3 small | Manual | Polish + tests |

---

## Phase 0: Backend Complete ✅

**What's Done:**
- Prisma schema (User, Category, Transaction, Budget, ThresholdAlertState)
- OAuth2 authentication (Google/GitHub)
- REST API (categories, transactions, budgets)
- WebSocket server with threshold alerts
- Comprehensive test suite (auth, CRUD, isolation, budgets, WS)

**Tests Passing:**
```
✅ auth.test.ts (OAuth login, user provisioning, session)
✅ categories.test.ts (CRUD, deletion reassignment, Uncategorized protected)
✅ transactions.test.ts (CRUD, validation, filtering)
✅ isolation.test.ts (cross-user access returns 404)
✅ budgets.test.ts (calculations, currency matching, usage %)
✅ ws-alerts.test.ts (threshold firing, once-per-month, auth)
```

**Commits:**
- `ceceb91`: Initial CapTrack backend implementation

---

## Phase 1: Architecture & Planning 📋 (Current)

**Deliverables:**
1. ✅ CLAUDE.md - Development guidelines
2. ✅ ARCHITECTURE.md - Design patterns & examples
3. 📝 PLAN.md - This file (master + detailed plans)
4. 🔄 Setup instructions in README

**Commits (Small):**
1. Add CLAUDE.md + ARCHITECTURE.md documentation (1 commit)
2. Update README with setup & dev workflow (1 commit)

**No code changes this phase—planning only.**

---

## Phase 2: Frontend Core Setup 🚀 (5-7 Small Commits)

**Goal:** Authentication flow, routing, basic layout (no feature logic).

**Detailed Plan:** See [PHASE_2_FRONTEND_CORE.md](#phase-2-detailed-plan) below

**Key Components:**
- AuthPage (Google/GitHub buttons)
- ProtectedRoute wrapper
- AppShell (header, nav, alert container)
- Router setup

**What Gets Tested:**
- Auth flow redirects to OAuth
- Session persists across refresh (reads cookie)
- Unauthed users see login page
- Authed users see dashboard

**Commits:**
1. Add base folder structure + main entry
2. Add Router + AuthPage
3. Add AppShell + ProtectedRoute
4. Add useMe hook + auth API client
5. Add global styles + theme variables
6. Add common UI components (Button, Input, Modal, etc.)
7. Verify login flow manually in browser

---

## Phase 3: CRUD Features 🚀 (5-7 Small Commits)

**Goal:** Categories, Transactions, Budgets UI with full Create/Read/Update/Delete.

**Detailed Plan:** See [PHASE_3_CRUD_FEATURES.md](#phase-3-detailed-plan) below

**Key Pages/Components:**
- TransactionsPage (table, filters, create/edit modal)
- CategoriesPage (list, create/rename/delete)
- Dashboard (budget cards, month picker)

**What Gets Tested:**
- Create transaction → appears in list
- Edit transaction → updates immediately
- Delete transaction → removed from list
- Category deletion → transactions move to Uncategorized
- Budget set → totals calculate correctly
- Filters work (search, date range, amount range, category)

**Commits:**
1. Add Dashboard + budget calculations
2. Add TransactionsPage + table component
3. Add transaction create/edit modal
4. Add transaction filters (search, category, date range, amount)
5. Add CategoriesPage + category CRUD
6. Add form validation (client-side Zod)
7. Add empty states + loading spinners

---

## Phase 4: Real-Time WebSocket Alerts 🚀 (3-5 Small Commits)

**Goal:** WebSocket integration, threshold alerts, toast notifications.

**Detailed Plan:** See [PHASE_4_WEBSOCKET_ALERTS.md](#phase-4-detailed-plan) below

**Key Components:**
- WsProvider (singleton, mounts at root)
- AlertBanner (persistent, dismissable)
- ToastContainer (auto-dismiss)
- useWsAlerts hook

**What Gets Tested (Manual):**
- Connect to WS on page load
- Create transactions → watch budget update in real-time
- Cross 50% → toast notification appears
- Cross 80% → second toast
- Cross 100% → third toast
- Edit transaction to drop below threshold → no re-fire
- Dismiss alert → marked as acknowledged
- Reconnect → only unacknowledged alerts shown
- Open two browsers as different users → isolated alerts

**Commits:**
1. Add WsProvider + context setup
2. Add AlertBanner UI component
3. Add ToastContainer + useWsAlerts hook
4. Add toast notifications on threshold alerts
5. Add alert dismissal + acknowledge flow

---

## Phase 5: Polish & Final Testing 🚀 (2-3 Small Commits)

**Goal:** Responsive design, accessibility, README, final manual QA.

**Detailed Plan:** See [PHASE_5_POLISH.md](#phase-5-detailed-plan) below

**What Gets Tested:**
- Responsive layout (mobile, tablet, desktop)
- Dark mode toggle (if time allows)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements (buttons, modals, alerts)
- Form validation error messages
- Loading states on all mutations
- Error handling (network failures, auth errors)

**Commits:**
1. Add responsive styles + mobile layout
2. Add accessibility (ARIA labels, focus states)
3. Update README with OAuth setup + deployment

---

## Planning-First Workflow

**Before any code is written:**

1. **Create a detailed sub-plan** (see Phase 2, 3, 4, 5 plans below)
2. **Review with manager** (you)
3. **Only then:** implement, test, commit (small)
4. **Verify:** tests pass + manual check in browser
5. **Move to next sub-plan**

**This ensures:**
- ✅ Alignment before work starts
- ✅ Small, reviewable commits
- ✅ Tests at each step
- ✅ Early feedback (breaks caught before they compound)

---

# Detailed Phase Plans

## Phase 2 Detailed Plan

**Title:** Frontend Core Setup (Auth, Routing, Layout)

**Commits:** 7 small commits

**Commit 1: Base Folder Structure + Entry Point**
- Create `client/src/` folder structure (pages/, components/, hooks/, api/, etc.)
- Create `client/src/main.tsx` (React app entry)
- Create `client/src/App.tsx` (Router skeleton)
- Create `client/src/types/index.ts` (shared types)
- **Test:** `npm run dev` starts without errors, Vite serves on 5173

**Commit 2: Router Setup + AuthPage**
- Create `client/src/pages/AuthPage.tsx` (Google/GitHub buttons)
- Set up `BrowserRouter` in `App.tsx`
- Add routes: `/login` (AuthPage), `/dashboard`, `/transactions`, etc.
- **Test:** Open `http://localhost:5173/login`, see two OAuth buttons

**Commit 3: API Client + useMe Hook**
- Create `client/src/api/client.ts` (fetch wrapper with credentials)
- Create `client/src/api/authApi.ts` (GET /api/auth/me, POST /api/auth/logout)
- Create `client/src/hooks/useMe.ts` (useQuery for current user)
- **Test:** After OAuth callback, useMe() returns user object

**Commit 4: ProtectedRoute + AppShell**
- Create `client/src/components/layout/ProtectedRoute.tsx` (redirects to /login if 401)
- Create `client/src/components/layout/AppShell.tsx` (header, nav, main content)
- Wrap routes with ProtectedRoute
- **Test:** Unauthenticated access → redirects to /login; authenticated → shows AppShell

**Commit 5: Global Styles + Theme**
- Create `client/src/styles/global.css` (light theme variables)
- Create `client/src/styles/variables.css` (colors, spacing, typography)
- Import in `main.tsx`
- **Test:** Buttons, inputs have consistent styling

**Commit 6: Common UI Components**
- Create `client/src/components/common/Button.tsx`
- Create `client/src/components/common/Input.tsx`
- Create `client/src/components/common/Modal.tsx`
- Create `client/src/components/common/LoadingSpinner.tsx`
- Create `client/src/components/common/EmptyState.tsx`
- **Test:** Components render with correct props

**Commit 7: Dashboard Skeleton + Manual Test**
- Create `client/src/pages/Dashboard.tsx` (basic skeleton)
- Add to Router
- **Manual Test:** 
  1. `npm run db:up` (start Postgres)
  2. `npm run dev` (start backend + frontend)
  3. Visit `http://localhost:5173`
  4. Click "Continue with Google"
  5. Get redirected to Google OAuth (or see test provider login)
  6. Get redirected back to dashboard
  7. Session persists on page refresh
  8. Logout button clears cookie

---

## Phase 3 Detailed Plan

**Title:** CRUD Features (Categories, Transactions, Budgets)

**Commits:** 7 small commits

**Commit 1: Budgets API + useBudget Hook + Dashboard**
- Create `client/src/api/budgetsApi.ts` (GET/PUT /api/budgets/:yearMonth)
- Create `client/src/hooks/useBudget.ts` (useQuery + useMutation)
- Create `client/src/components/dashboard/BudgetSummaryCards.tsx` (spent, remaining, %)
- Create `client/src/components/dashboard/MonthPicker.tsx` (prev/next month)
- Update `Dashboard.tsx` with these components
- **Test:**
  - Open dashboard, see "No budget set"
  - Set a budget, see cards update
  - Create a transaction, watch spent increase in real-time (WS not yet)

**Commit 2: Categories API + useCategories Hook**
- Create `client/src/api/categoriesApi.ts` (GET/POST/PATCH/DELETE /api/categories)
- Create `client/src/hooks/useCategories.ts` (useQuery + useMutation)
- **Test:** `useCategories()` returns user's categories

**Commit 3: Transactions API + useTransactions Hook**
- Create `client/src/api/transactionsApi.ts` (GET/POST/PUT/DELETE /api/transactions)
- Create `client/src/hooks/useTransactions.ts` (useQuery with filter params)
- Create `client/src/hooks/useCreateTransaction.ts`, `useUpdateTransaction.ts`, `useDeleteTransaction.ts`
- **Test:** Hooks fetch, create, update, delete transactions

**Commit 4: Transactions Table + Create/Edit Modal**
- Create `client/src/components/transactions/TransactionsTable.tsx` (responsive table)
- Create `client/src/components/transactions/TransactionForm.tsx` (reusable form)
- Create `client/src/components/transactions/TransactionRow.tsx` (single row with actions)
- Update `TransactionsPage.tsx` with table + modal
- **Test:**
  - Create transaction → appears in table
  - Edit transaction → form pre-fills, saves changes
  - Delete transaction → removed from table

**Commit 5: Transaction Filters**
- Create `client/src/components/transactions/FilterBar.tsx` (search, category, date range, amount range)
- Wire filters to URL search params
- Wire URL params to `useTransactions()` query key
- **Test:**
  - Type in search → table filters
  - Select category → table filters
  - Select date range → table filters
  - Refresh page → filters persist

**Commit 6: Categories Page + Category CRUD**
- Create `client/src/pages/CategoriesPage.tsx`
- Create `client/src/components/categories/CategoryList.tsx`
- Create `client/src/components/categories/CategoryForm.tsx`
- Create `client/src/components/categories/CategoryItem.tsx`
- **Test:**
  - Create category → appears in list
  - Rename category → updates
  - Delete category → removed; transactions move to Uncategorized

**Commit 7: Client-Side Validation + Empty States**
- Create `client/src/validation/formSchemas.ts` (Zod schemas mirroring backend)
- Add validation feedback to all forms
- Create empty state components (no transactions, no categories, no search results, no budget set)
- **Test:**
  - Submit empty form → validation error
  - Clear all transactions → see empty state
  - Search with no results → see no results message

---

## Phase 4 Detailed Plan

**Title:** Real-Time WebSocket Alerts

**Commits:** 5 small commits

**Commit 1: WsProvider Context + Connection**
- Create `client/src/ws/WsProvider.tsx` (connect on mount, reconnect on disconnect)
- Create `client/src/ws/types.ts` (message shapes)
- Wrap app in WsProvider at root
- **Test:**
  - Check browser DevTools → WebSocket connection to `ws://localhost:3001/ws`
  - Connection stays open during navigation

**Commit 2: useWsAlerts Hook**
- Create `client/src/hooks/useWsAlerts.ts` (subscribe to alerts, manage dismissed state)
- Hook calls `send({ type: 'subscribe', yearMonth })`
- Receives `budget_status` and `threshold_alert` messages
- **Test:**
  - Open DevTools, send a transaction via API
  - See WebSocket message from server with updated budget
  - No alert yet (budget not set or threshold not crossed)

**Commit 3: AlertBanner Component**
- Create `client/src/components/alerts/AlertBanner.tsx` (persistent list of unfired alerts)
- Create `client/src/components/alerts/AlertItem.tsx` (single alert with dismiss button)
- **Test:**
  - Dispatch threshold alert via WebSocket
  - Alert appears in banner
  - Click dismiss → calls `acknowledge_alert`, alert disappears

**Commit 4: ToastContainer + Toast Notifications**
- Create `client/src/components/alerts/ToastContainer.tsx` (stacked toasts)
- Integrate with `useWsAlerts()` hook to show toast on each new alert
- Toast auto-dismisses after 5 seconds
- **Test:**
  - Create transaction, cross 50% threshold
  - Toast notification appears
  - Auto-dismisses
  - Refresh page, toast gone (acknowledged)

**Commit 5: End-to-End WebSocket Test (Manual)**
- Set up a test scenario
- **Manual Test:**
  1. Set budget to $100
  2. Create transaction for $50 → see "Budget 50% used" toast + banner
  3. Create another $30 → see "Budget 80% used" toast (no duplicate 50%)
  4. Create another $20 → see "Budget 100% used" toast
  5. Edit first transaction to $10 → still see all 3 alerts (no retraction)
  6. Dismiss alerts → banner clears
  7. Refresh page → banner empty (alerts acknowledged)
  8. Open second browser tab as different user → no alerts visible

---

## Phase 5 Detailed Plan

**Title:** Polish & Final Testing

**Commits:** 3 small commits

**Commit 1: Responsive Styles**
- Add mobile breakpoints to global styles
- Convert table to cards on small screens
- Stack forms vertically on mobile
- Ensure buttons are touch-friendly (48px minimum)
- **Test:**
  - Open in DevTools device emulation (iPhone, tablet, desktop)
  - Layout adjusts correctly
  - No horizontal scroll

**Commit 2: Accessibility + Keyboard Navigation**
- Add ARIA labels to buttons, modals, alerts
- Add focus states (outline, color change)
- Ensure modals trap focus
- Test with keyboard (Tab, Enter, Escape)
- **Test:**
  - Tab through page → all interactive elements focused
  - Press Escape in modal → closes
  - Screen reader announces alerts

**Commit 3: README + Final QA**
- Update README with:
  - OAuth app creation steps (Google, GitHub)
  - Exact redirect URIs for local dev
  - `npm run dev` startup sequence
  - Test user account instructions
  - Known limitations or TODOs
- **Manual Test Checklist:**
  - [ ] Fresh install: npm install, npm run db:up, npm run dev
  - [ ] OAuth flow works (at least one provider)
  - [ ] Login → session persists → logout clears
  - [ ] Create category → appears in list
  - [ ] Create transaction → appears in list, budget updates
  - [ ] Edit transaction → changes saved
  - [ ] Delete transaction → removed, budget updates
  - [ ] Delete category → transactions move to Uncategorized
  - [ ] Set budget → totals calculate
  - [ ] Filter transactions → results narrow
  - [ ] Search transactions → results narrow
  - [ ] Cross 50%/80%/100% thresholds → alerts fire once
  - [ ] Dismiss alert → acknowledge persists
  - [ ] Mobile layout → no horizontal scroll
  - [ ] Two logged-in users → data isolated
  - [ ] All tests pass: `npm run test`

---

## Definition of "Done" for Each Phase

| Phase | Criteria |
|-------|----------|
| 2 | Auth flow manual tested, no console errors, 0 test failures |
| 3 | All CRUD operations tested, filters work, validation shown |
| 4 | WebSocket alerts appear, once-per-month firing verified, cross-user isolation confirmed |
| 5 | Responsive layout verified, accessibility checked, README complete, all manual tests pass |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Large commits hard to review | Keep commits < 500 LOC, one feature per commit |
| Bugs in frontend break backend tests | Never modify backend during frontend phase |
| Unclear requirements | Plan each phase in detail before starting |
| Lost context between sessions | CLAUDE.md + ARCHITECTURE.md + this PLAN.md stay current |
| WS alerts don't work | Test manually in real browser with DevTools, not just tests |

---

## Next Step

**Ask Manager:**
- "Does Phase 2 plan look good?"
- Any adjustments before implementation?
- Timeline constraints?
- Priority (complete one phase fully, or parallel work)?

**Then proceed with Phase 2 implementation (small commits + tests).**

