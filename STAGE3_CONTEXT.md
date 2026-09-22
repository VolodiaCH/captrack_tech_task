# CapTrack — Stage 3 Handoff Context

**Date:** 2026-09-22  
**Current Status:** Backend fully built and tested. Frontend auth flow working. Ready for CRUD UI implementation.

---

## What's Done ✓

- [x] **Backend (Phase 1):** Full schema, auth system (OAuth Google/GitHub + JWT cookie), all services (categories, transactions, budgets, alerts), all routes, WebSocket server for real-time threshold alerts, complete Vitest test suite (6 files, 43 tests, all passing).
- [x] **Frontend (Phase 2):** Core structure (AuthPage, Dashboard, ProtectedRoute/AppShell, common components), API client, TanStack Query hooks, styles with CSS variables, light theme only.
- [x] **Setup & Environment:** npm workspaces, docker-compose with Postgres on port 5433, `.env` management with dotenv-cli (server) and `envDir` (Vite), all docs (CLAUDE.md with SOLID rules, ARCHITECTURE.md, RUN_LOCALLY.md with OAuth setup steps).
- [x] **Recent fixes (commit `3c0d56f`):** Node v22+ `tsx --loader` → `tsx` CLI, ESM `require()` → proper import in auth routes, added missing `cors` package, Prisma migrations created and working.

**Current verified state:** `npm run dev` boots both backend (`:3001`) and frontend (`:5173`). OAuth flow works: click "Continue with Google/GitHub" → complete login on provider → land on Dashboard with session cookie. `/api/auth/me` responds correctly. Backend tests mostly pass (some data isolation edge cases to verify during Phase 3, but auth + basic CRUD proven).

---

## What's Next: Stage 3 — CRUD UI Implementation

**7 commits, each a small, focused piece of the Phase 3 plan from `PLAN.md`:**

### Commit 1: Categories API client + hook
**What:** Thin wrapper around `/api/categories/*` endpoints.  
**Files:**
- `client/src/api/categoriesApi.ts` — `getCategories()`, `createCategory(name)`, `updateCategory(id, name)`, `deleteCategory(id)`. No business logic, just HTTP calls via `api.client.get/post/put/delete()`.
- `client/src/hooks/useCategories.ts` — `useQuery(['categories'], getCategories)` + `useMutation(createCategory)` / `updateCategory` / `deleteCategory` with `queryClient.invalidateQueries(['categories'])` on success.

**Why separate commit:** Establishes the API client pattern for all future resources. Easier to review and test in isolation.

### Commit 2: Transactions API client + hook
**What:** Same pattern as Commit 1, but for transactions with filters.  
**Files:**
- `client/src/api/transactionsApi.ts` — `getTransactions(filters)`, `createTransaction(data)`, `updateTransaction(id, data)`, `deleteTransaction(id)`. Filters: `{ search?, categoryId?, dateRange?, startDate?, endDate?, minAmount?, maxAmount?, page?, pageSize? }`.
- `client/src/hooks/useTransactions.ts` — reads filters from URL search params via React Router's `useSearchParams()`, builds query key `['transactions', filters]`, calls API, caches via React Query.

**Why separate commit:** Transactions are the most complex resource (most filters). Separating this establishes the filter + URL search params pattern reused elsewhere.

### Commit 3: Budgets API hook + Dashboard budget summary cards
**What:** Add budget display to the Dashboard (what's already scaffolded but empty).  
**Files:**
- `client/src/hooks/useBudget.ts` — `useQuery(['budget', yearMonth], () => budgetsApi.getBudget(yearMonth))`. Returns `{ hasBudget, amount, currency, spent, remaining, usagePct }` (already shaped by backend).
- `client/src/api/budgetsApi.ts` — `getBudget(yearMonth)`, `createOrUpdateBudget(yearMonth, { amount, currency })`.
- Update `client/src/pages/Dashboard.tsx` — add a month picker (already exists in scaffold, just needs wiring), pull `useBudget()` hook, render 3 cards: "Budget", "Spent", "Remaining" with usage % bar. If no budget, render "No budget set — create one" CTA button.

**Why separate commit:** Establishes budget display before diving into transaction CRUD. Verifies the WebSocket alert system will work (WS pushes `budget_status` → React Query cache → Dashboard re-renders).

### Commit 4: Transactions table + create/edit modal
**What:** Display list of transactions, create/edit inline via modal form.  
**Files:**
- `client/src/components/transactions/TransactionsTable.tsx` — renders `transactions` array as table (desktop) or card grid (mobile, already in responsive CSS). Columns: Date, Category, Amount, Notes. Actions: Edit, Delete buttons.
- `client/src/components/transactions/TransactionForm.tsx` — form fields: date, category dropdown, amount, currency, notes. Zod client-side validation (mirrors backend `createTransactionSchema`). No API calls; parent provides `onSubmit` callback.
- `client/src/components/transactions/TransactionRow.tsx` — single transaction row/card, handles click → open modal.
- Update `client/src/pages/TransactionsPage.tsx` — use `useTransactions()` hook, render `TransactionsTable`, add "Create Transaction" button → opens modal with `TransactionForm`, submit → `useCreateTransaction().mutate(data)` → modal closes on success.

**Why separate commit:** UI complexity warrants its own review. Establishes modal + form pattern reused for categories.

### Commit 5: Transaction filters (search, date range, category, amount)
**What:** Filter bar above the transactions table. All filters live in URL search params for shareability.  
**Files:**
- `client/src/components/transactions/FilterBar.tsx` — inputs: search text, category dropdown (from `useCategories()`), dateRange selector (thisMonth/lastMonth/custom), minAmount/maxAmount. On change → update `useSearchParams()` → React Query refetches via the new query key.
- Update `client/src/pages/TransactionsPage.tsx` — add FilterBar before TransactionsTable, pass filters from search params.

**Why separate commit:** Filters are a distinct feature and should be reviewable independently. Once working, the same pattern applies to other pages.

### Commit 6: Categories page + CRUD
**What:** Full CRUD UI for categories (list, create, rename, delete).  
**Files:**
- `client/src/pages/CategoriesPage.tsx` — use `useCategories()` hook, render category list.
- `client/src/components/categories/CategoryList.tsx` — map over `categories`, render each in a `CategoryItem`.
- `client/src/components/categories/CategoryItem.tsx` — display name, Edit/Delete buttons. Edit → inline edit field or modal (simpler: inline). Delete → confirm modal → `useDeleteCategory().mutate(id)`.
- `client/src/components/categories/CategoryForm.tsx` — form: category name input. Zod validation (min 1 char, max 50).
- Add route to `client/src/App.tsx` — `<Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />`.

**Why separate commit:** Full page with a new route. Reviewable independently. Establishes the page pattern.

### Commit 7: Client-side validation + empty states
**What:** Polish UX with error messages, loading spinners, and empty-state placeholders.  
**Files:**
- Create/update `client/src/validation/formSchemas.ts` — Zod schemas: `createTransactionSchema`, `updateTransactionSchema`, `createCategorySchema`, `updateCategorySchema` (mirrors backend exactly). Components import and use these for real-time validation feedback.
- Update all forms (`TransactionForm.tsx`, `CategoryForm.tsx`) — on change, validate via `schema.safeParse()`, display field errors inline.
- Update `TransactionsPage.tsx`, `CategoriesPage.tsx`, `Dashboard.tsx` — add `LoadingSpinner` while queries load, `EmptyState` when no results ("No transactions yet" / "No categories yet"), etc.
- Add error boundaries or error toast display on mutation failures.

**Why separate commit:** Validation logic and empty states can be added/tweaked without touching core CRUD logic. Clean separation.

---

## Key Architectural Rules (from CLAUDE.md — **strictly enforce these**)

1. **Components are dumb UI:** No data fetching. Props in, JSX out. All data comes via hooks passed as props.
2. **Hooks own data fetching:** `useTransactions()` calls the API. Components never call `api/*` directly.
3. **Routes orchestrate:** Pages pull data via hooks, pass to components.
4. **Services have no HTTP knowledge:** Already done on backend — enforced for frontend too.
5. **Validation in Zod schemas:** Both client and server validate; client gives feedback instantly, server enforces.
6. **DI at boundaries:** App-level mounts `QueryClientProvider`, `WsProvider`, etc. — don't create new instances mid-tree.

---

## Important Files & Patterns

### Backend (reference — already built, don't touch)
- `server/src/services/*.service.ts` — pure business logic, no HTTP.
- `server/src/routes/*.routes.ts` — thin orchestration, call services, return HTTP responses.
- `server/test/*.test.ts` — isolated tests using real Postgres `captrack_test` DB, `FakeProvider` for OAuth.

### Frontend (what you're building)
- `client/src/pages/*.tsx` — containers, use hooks, render components.
- `client/src/components/**/*.tsx` — pure UI, props only, max ~50 lines.
- `client/src/hooks/*.ts` — React Query queries/mutations, call API client, return typed data.
- `client/src/api/*.ts` — thin HTTP wrappers, no business logic.
- `client/src/validation/formSchemas.ts` — Zod schemas, shared by forms + backend.

### Shared patterns
**Hook for querying:**
```tsx
export function useTransactions(filters: TransactionFilters) {
  return useQuery(['transactions', filters], () => transactionsApi.getTransactions(filters));
}
```

**Hook for mutating:**
```tsx
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation(transactionsApi.createTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
    },
  });
}
```

**Component using hook:**
```tsx
export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions(filters);
  if (isLoading) return <LoadingSpinner />;
  if (!transactions?.length) return <EmptyState />;
  return <TransactionsTable transactions={transactions} onDelete={...} />;
}
```

---

## Git Workflow (per user's rules)

1. **Small commits, each with a single concern.** One commit = one feature, one bug fix, one file pattern.
2. **Always test before committing:** `npm run test -w server` for backend changes, manual browser test for frontend UI.
3. **Commit message format:**
   ```
   Short imperative summary (under 60 chars)
   
   Longer explanation if needed.
   
   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
   ```

---

## Testing for Stage 3

- **Backend:** Already passing. Isolation + auth tests cover cross-user access → 404, so new routes inherit these guarantees.
- **Frontend:** Manual in-browser for now:
  1. `npm run dev` — both servers boot.
  2. Login via real OAuth (Google/GitHub).
  3. Dashboard shows month picker + budget summary (will be empty if no budget set).
  4. Navigate to Transactions page, create a transaction, see it in the list.
  5. Filter by category, date range, search — see filters update URL.
  6. Navigate to Categories page, create/rename/delete categories.
  7. Create a budget on Dashboard, watch spent/remaining update.
  8. Watch threshold alerts fire (50/80/100%) as you add transactions crossing those thresholds.

---

## Common Gotchas & Reminders

1. **URL search params are the source of truth for filters.** Don't use `useState` for filters; read/write via `useSearchParams()`. This makes filters shareable (copy the URL, the filters persist).
2. **React Query cache keys must be stable.** Always use the exact same array shape for the same query. `['transactions', { search: '', categoryId: null }]` is different from `['transactions', {}]` — be consistent.
3. **No prop drilling.** If a component needs data from a hook, it should use the hook directly (or receive the data as a prop from its immediate parent).
4. **Backend URL is always `env.VITE_API_BASE_URL`** (loaded from root `.env` via Vite's `envDir: "../"`). Don't hardcode `http://localhost:3001` in components.
5. **Use Decimal for amounts in TypeScript.** Backend returns `Decimal` types from Prisma — handle them as strings in JSON (Prisma serializes them), then parse to `parseFloat()` for display. Don't lose precision.
6. **Empty states matter.** If there are no transactions, show "No transactions yet" with a CTA to create one, not a blank page.

---

## Session Handoff Checklist

When starting Stage 3 in the next session:

- [ ] Read this file (`STAGE3_CONTEXT.md`).
- [ ] Run `npm run dev` to verify everything still boots.
- [ ] Check the 7 commits listed above haven't been done yet (they're the next 7 commits).
- [ ] Start with Commit 1 (Categories API client + hook).
- [ ] Follow the git workflow: one small commit per concern, test before committing.
- [ ] If you hit an error or blocker, check CLAUDE.md (SOLID rules) and ARCHITECTURE.md (structure) before asking.

---

## Helpful References

- **CLAUDE.md** — SOLID principles, naming conventions, code style, component size guidelines.
- **ARCHITECTURE.md** — data model, backend/frontend structure, dependency flow, testing strategy.
- **RUN_LOCALLY.md** — setup, OAuth app creation, troubleshooting, commands reference.
- **PLAN.md** — overall project plan, build order, verification steps.
- **Backend tests** (`server/test/*.test.ts`) — reference for how to structure queries, how auth/isolation works.

---

**Good luck with Stage 3! You've got a solid foundation. Stick to the SOLID rules and small commits, and this will ship smoothly.**
