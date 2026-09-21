# CapTrack Development Guide

This document establishes the architectural principles, code organization, and development practices for CapTrack. All contributors should follow these guidelines to maintain a modular, extensible, and maintainable codebase.

## Core Principles: SOLID

We enforce three core SOLID principles to balance pragmatism with extensibility:

### 1. **Single Responsibility Principle (S)**
Each file, component, or service has **one reason to change**.

- **Backend**: A service handles one domain concept (e.g., `category.service.ts` only manages categories, never transactions).
- **Frontend**: A component renders one UI concern (e.g., `CategoryForm.tsx` is ONLY the form; filtering logic lives elsewhere).
- **Tests**: One test file tests one unit; one test describes one behavior.

**How to recognize a violation:**
- Function/file name includes "and" or "or" (`fetchAndRender`, `userAndAdmin`)
- A service imports from multiple other services at the same level
- A component has multiple `useState` calls tracking unrelated concerns
- A file exceeds 200 lines

**Fix:** Split into separate, focused units.

### 2. **Open/Closed Principle (O)**
Code is **open for extension, closed for modification**.

- Add new features by extending (new components, new routes, new services), not by editing existing ones.
- Use dependency injection and strategy patterns to swap implementations without changing callers.
- Interfaces define contracts; concrete implementations are swapped at boundaries.

**How to recognize a violation:**
- Adding a new page type requires editing the router file
- Adding a new filter type requires editing the filter component
- Adding a new alert type requires editing the alert handler

**Fix:** Use polymorphism (inheritance, interfaces, unions) so new types slot in without touching core logic.

### 3. **Dependency Inversion Principle (D)**
High-level modules depend on **abstractions, not low-level implementations**.

- Components depend on hooks/APIs, not directly on services or utils.
- Services depend on interfaces, not concrete implementations.
- Inject dependencies at the module boundary (root/app level), not inside functions.

**How to recognize a violation:**
- A component imports and calls a service directly
- A service imports another service at the same level
- No way to swap implementations for testing

**Fix:** Define interfaces; pass dependencies as arguments or via Context/DI.

---

## File Organization

### Backend (`server/src`)

```
server/src/
├── config/           # Environment & settings (loaded once at startup)
├── prisma/           # Database client singleton
├── auth/             # Authentication layer (JWT, cookies, OAuth providers)
│   ├── jwt.ts        # Token sign/verify (no dependencies on routes/services)
│   ├── cookie.ts     # Cookie read/write (pure functions)
│   ├── middleware.ts # Express middleware (requireAuth, extractUser)
│   ├── providers/    # OAuth provider implementations
│   │   ├── types.ts  # OAuthProvider interface (the contract)
│   │   ├── google.ts # Concrete implementation
│   │   ├── github.ts # Concrete implementation
│   │   ├── fake.ts   # Test implementation
│   │   └── index.ts  # Factory/registry (DI boundary)
│   └── auth.service.ts # User provisioning (depends on Prisma, not on routes)
├── routes/           # HTTP endpoints (thin, orchestrate calls to services)
│   ├── auth.routes.ts
│   ├── categories.routes.ts
│   ├── transactions.routes.ts
│   └── budgets.routes.ts
├── services/         # Business logic (pure, testable, no HTTP/WS knowledge)
│   ├── category.service.ts
│   ├── transaction.service.ts
│   ├── budget.service.ts
│   └── alert.service.ts
├── ws/               # WebSocket server (route, handlers, connection manager)
│   ├── server.ts     # Attach to HTTP server, auth on upgrade
│   ├── connectionManager.ts # Manages active connections
│   ├── handlers.ts   # Message handlers (calls services, broadcasts)
│   └── messages.ts   # Zod schemas (contracts for client↔server)
├── middleware/       # Express middleware (auth, validation, error handling)
│   ├── requireAuth.ts
│   ├── validate.ts
│   └── errorHandler.ts
├── utils/            # Pure utility functions (date helpers, etc.)
│   └── dateRange.ts
├── app.ts            # Express app assembly (middleware, routes)
└── index.ts          # HTTP server setup, WebSocket attachment, startup
```

**Key Rules:**
- **Services have no HTTP/WebSocket knowledge.** They receive plain objects, return plain objects.
- **Routes orchestrate:** receive HTTP request, call 1–2 services, return HTTP response.
- **Middleware is thin:** extract data, validate, pass to next handler.
- **No circular imports:** Services don't import routes; routes import services.
- **DI at boundaries:** App-level registers providers, routes, middleware. Tests inject fakes.

### Frontend (`client/src`)

```
client/src/
├── main.tsx          # App entry, providers (QueryClient, Router, WsProvider)
├── App.tsx           # Root routing component
├── pages/            # Page-level containers (match URL routes)
│   ├── AuthPage.tsx       # SSO login UI
│   ├── Dashboard.tsx      # Month picker + budget cards
│   ├── TransactionsPage.tsx
│   ├── CategoriesPage.tsx
│   └── NotFoundPage.tsx
├── components/       # Reusable UI components (small, focused, no data fetching)
│   ├── layout/
│   │   ├── AppShell.tsx    # Header, nav, alerts container
│   │   ├── ProtectedRoute.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── BudgetSummaryCards.tsx
│   │   ├── MonthPicker.tsx
│   │   └── NoBudgetSet.tsx
│   ├── transactions/
│   │   ├── TransactionsTable.tsx
│   │   ├── TransactionForm.tsx  # Form, no API calls
│   │   ├── FilterBar.tsx
│   │   ├── TransactionRow.tsx
│   │   └── EmptyTransactions.tsx
│   ├── categories/
│   │   ├── CategoryList.tsx
│   │   ├── CategoryForm.tsx
│   │   └── CategoryItem.tsx
│   ├── alerts/
│   │   ├── AlertBanner.tsx   # Persistent alert list
│   │   ├── ToastContainer.tsx # Toast notifications
│   │   └── AlertItem.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── api/              # API client (thin wrappers, no business logic)
│   ├── client.ts     # Fetch wrapper with credentials
│   ├── authApi.ts    # /api/auth/* routes
│   ├── categoriesApi.ts
│   ├── transactionsApi.ts
│   ├── budgetsApi.ts
│   └── types.ts      # Response/request shapes (mirrors backend)
├── hooks/            # Custom React hooks (data fetching, state, UI logic)
│   ├── useMe.ts      # Current user (useQuery)
│   ├── useCategories.ts
│   ├── useTransactions.ts
│   ├── useBudget.ts
│   ├── useCreateTransaction.ts  # useMutation(postTransaction)
│   ├── useUpdateTransaction.ts
│   ├── useDeleteTransaction.ts
│   └── useWsAlerts.ts
├── ws/               # WebSocket client (single instance, event dispatching)
│   ├── WsProvider.tsx  # React context, connects on mount
│   ├── useWsAlerts.ts  # Hook to subscribe to alerts
│   └── types.ts        # WebSocket message types
├── validation/       # Zod schemas (client-side, mirror backend)
│   └── formSchemas.ts
├── state/            # Zustand stores (if needed; prefer React Query)
│   └── alertStore.ts # Toast/banner state
├── styles/           # Global CSS (variables, light theme, responsive)
│   ├── global.css
│   ├── variables.css
│   └── responsive.css
└── types/            # Shared TypeScript types
    └── index.ts
```

**Key Rules:**
- **Components are dumb UI.** Props in, JSX out. No data fetching, no side effects beyond layout.
- **Hooks own data fetching.** `useTransactions()` calls the API, caches via React Query.
- **Pages orchestrate.** Pull data via hooks, pass to components.
- **WsProvider is a singleton.** Mounted at root, provides a single socket to all pages.
- **No API calls in components.** Use hooks. If a hook would be overkill, create one anyway.
- **Validation lives in `formSchemas.ts`.** Both client and server validate; client gives feedback, server enforces.

---

## Dependency Flow (Architecture Diagram)

### Backend

```
HTTP Client
    ↓
routes/ (thin)
    ↓
services/ (business logic)
    ↓
prisma/client (data)
```

**Routes never call routes. Services never call routes. Tests inject fake services.**

### Frontend

```
User (browser)
    ↓
pages/ (containers)
    ↓
components/ (UI) + hooks/ (data)
    ↓
api/ (HTTP client)
    ↓
Backend
```

**Components never call api/ directly. Pages call hooks. Hooks call api/.**

---

## Adding a New Feature: Step-by-Step

### Example: Add "Expense Tags" (Backend → Frontend)

#### Backend

1. **Update Prisma schema** (`server/prisma/schema.prisma`)
   - Add `Tag` model, relation to `Transaction`
   - Run `npx prisma migrate dev --name add_tags`

2. **Create service** (`server/src/services/tag.service.ts`)
   - Functions: `createTag()`, `getTags()`, `updateTag()`, `deleteTag()`
   - No HTTP knowledge; accept plain objects, return plain objects
   - **Do not** import from routes, app, or express

3. **Create routes** (`server/src/routes/tags.routes.ts`)
   - Import `requireAuth`, validation middleware, `tag.service`
   - Thin handlers: parse request → call service → format response
   - 200 = success, 400 = validation, 404 = not found, 500 = server error

4. **Add to app.ts**
   - `app.use("/api/tags", tagRoutes);`

5. **Write tests** (`server/test/tags.test.ts`)
   - Test service isolation (cross-user access returns 404)
   - Test validation (required fields, unique constraints)
   - Mock `loginAs(app, "google")` and use factory helpers

#### Frontend

1. **Create API wrapper** (`client/src/api/tagsApi.ts`)
   - `GET /api/tags`, `POST /api/tags`, `PUT /api/tags/:id`, `DELETE /api/tags/:id`
   - Call `api.client.get(...)`; return typed response

2. **Create hooks** (`client/src/hooks/useTags.ts`, `useCreateTag.ts`, etc.)
   - `useTags()` = `useQuery(['tags'], () => tagsApi.getTags())`
   - `useCreateTag()` = `useMutation(tagsApi.createTag, { onSuccess: () => queryClient.invalidateQueries(['tags']) })`

3. **Create components** (`client/src/components/tags/TagList.tsx`, `TagForm.tsx`)
   - TagList: receives `tags: Tag[]` and `onDelete`, renders list
   - TagForm: receives `onSubmit`, renders form (no data fetching)

4. **Add to a page** (e.g., `TransactionsPage.tsx`)
   - Use `useTags()` hook
   - Pass tags to `TagList` component
   - Pass `useCreateTag().mutate` to `TagForm`

**No file should violate SOLID.** Each file has one reason to change.

---

## Component Size & Granularity

| File | Ideal Size | Example |
|---|---|---|
| Utility function | < 20 lines | `getYearMonth()`, `formatCurrency()` |
| Service function | < 30 lines | `createTransaction()` |
| React component | < 50 lines | `Button.tsx`, `EmptyState.tsx` |
| Page component | < 100 lines | `Dashboard.tsx` |
| Test | < 50 lines per test case | One `it()` is one behavior |

**If a file exceeds these: split it.**

---

## Testing Strategy

### Backend

- **auth.test.ts:** OAuth flow, user provisioning, session persistence
- **categories.test.ts:** CRUD, unique constraints, deletion reassignment
- **transactions.test.ts:** CRUD, validation, filtering
- **isolation.test.ts:** Cross-user access returns 404
- **budgets.test.ts:** Calculations, currency matching
- **ws-alerts.test.ts:** Connection auth, threshold firing, once-per-month

**All tests use real Postgres (`captrack_test` database). No mocked data layer.**

### Frontend

*(Not yet implemented, but will follow this pattern:)*

- **Unit tests (Vitest):** Components, hooks, utils in isolation
- **Integration tests (Testing Library):** User workflows (login → create transaction → see in list)
- **No E2E tests yet** (future: Playwright)

**Always test behavior, not implementation.**

---

## Naming Conventions

| Entity | Naming | Example |
|---|---|---|
| Service function | verb + noun | `createTransaction()`, `getBudgetStatus()` |
| React component | PascalCase | `TransactionForm.tsx` |
| React hook | `use` + noun | `useTransactions()`, `useBudget()` |
| API function | verb + resource | `fetchTransactions()`, `postTransaction()` |
| Route handler | express convention | `app.get()`, `app.post()` |
| Event handler | `handle` + action | `handleSubmit()`, `handleDelete()` |
| Zod schema | noun + `Schema` | `createTransactionSchema` |
| Utils | descriptive | `getYearMonth()`, `calculateUsagePercentage()` |

---

## Code Style & Practices

### Backend (TypeScript/Node.js)

- **No `any` types.** Use `unknown` if needed; prefer explicit types.
- **Async/await over `.then()`.** More readable.
- **Error messages are user-facing.** Throw descriptive errors; let middleware handle formatting.
- **No console.log in production code.** Use structured logging if needed (not in MVP).
- **All routes require authentication** (except `/api/auth/*`). Attach `requireAuth` middleware.
- **All mutation endpoints validate input.** Use `validateBody(schema)` middleware.

### Frontend (React/TypeScript)

- **No prop drilling.** Use React Query, Context, or stores.
- **Components are pure.** Same props = same render. No side effects in JSX.
- **Hooks own side effects.** Data fetching, subscriptions live in hooks.
- **No `useState` for server state.** React Query is the source of truth.
- **Form validation in Zod schemas.** Display errors from `schema.parse()`.
- **Accessibility first.** Buttons are `<button>`, inputs have `<label>`, modals trap focus.

---

## Before You Code

1. **Does this file have a clear, single reason to change?** If not, split it.
2. **Can this be tested in isolation?** If not, add a boundary (interface, factory).
3. **Would adding a new variant require editing this file?** If yes, refactor for extension.
4. **Are dependencies injected or hard-coded?** Hard-coded = hard to test.
5. **Is the name honest about what it does?** If the name is vague, behavior is probably mixed.

---

## Extending Later: Common Scenarios

### Add a new page

1. Create `pages/NewPage.tsx`
2. Create hooks it needs (e.g., `useNewData()`)
3. Create components for sections (e.g., `NewDataList.tsx`)
4. Add route to `App.tsx`
5. **No changes to existing code.**

### Add a new filter type

1. Add case to `dateRange` union in `transactionsApi.ts`
2. Add checkbox to `FilterBar.tsx`
3. Pass new filter to `useTransactions()` hook
4. **No changes to existing transaction logic.**

### Add a new alert type

1. Add type to WebSocket message schema
2. Add handler in `ws/handlers.ts`
3. Add UI in `AlertBanner.tsx`
4. **No changes to threshold logic.**

---

## Questions? Check Here First

- **"Where should this live?"** → Follow the file structure. Match the filename to the concern.
- **"Should I create a component or a hook?"** → Component if it returns JSX. Hook if it fetches/manages state.
- **"Can I call the API from a component?"** → No. Create a hook.
- **"Should I modify an existing service?"** → Add a new function, don't edit old ones.
- **"Is this testable?"** → If you can't isolate it, it's too coupled.

---

## Future Evolution

This guide is a snapshot. As CapTrack grows:

- **Migrate state to Zustand** if React Query feels limiting
- **Add E2E tests** once critical paths are stable
- **Extract shared hooks** into a custom hook library
- **Consider micro-frontends** if teams grow
- **Add structured logging** when debugging production issues

But always return to: **One file, one reason to change. Test in isolation. Extend, don't modify.**
