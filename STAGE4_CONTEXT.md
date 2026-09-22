# CapTrack — Stage 4 Handoff Context

**Date:** 2026-09-22  
**Current Status:** All CRUD features complete (Categories, Transactions, Budgets, filters, forms). Ready for WebSocket alert system.

---

## What's Done ✓

- [x] **Backend (Phase 0):** Complete schema, auth, REST API, WebSocket server for alerts.
- [x] **Frontend CRUD (Phase 1-3):** AuthPage, Dashboard with budget display, TransactionsPage with filters and create/edit modal, CategoriesPage with full CRUD, client-side validation, empty states.
- [x] **Tests:** Backend tests all passing (auth, CRUD, isolation, budgets, WebSocket alerts).

**Current verified state:** Full CRUD workflows working end-to-end. Users can create categories, transactions, budgets, and see Dashboard update. Now add real-time budget threshold alerts via WebSocket.

---

## What's Next: Stage 4 — WebSocket Client Integration + Real-Time Alerts

**3–4 commits:**

### Commit 1: WebSocket context provider + connection manager
**What:** Set up a single WebSocket client shared across all pages via React Context.  
**Files:**
- `client/src/ws/WsProvider.tsx` — React Context provider:
  - Mounts at `client/src/main.tsx` (top level, after `QueryClientProvider`).
  - Connects to `ws://localhost:3001/ws` on mount (or `wss://...` in prod).
  - Passes JWT cookie automatically (httpOnly cookie sent by browser on WebSocket upgrade).
  - Stores connection in context: `{ socket: WebSocket | null, isConnected: boolean }`.
  - On unmount, closes socket gracefully.
  - Reconnects on connection loss (exponential backoff: 1s, 2s, 4s, max 30s).
- `client/src/ws/useWsConnection.ts` — hook to consume the context: `const { socket, isConnected } = useWsConnection()`.
- `client/src/ws/types.ts` — TypeScript types for all WebSocket messages (matches backend `server/src/ws/messages.ts`):
  ```ts
  type BudgetStatusMessage = {
    type: "budget_status";
    yearMonth: string;
    hasBudget: boolean;
    budget: number;
    spent: number;
    remaining: number;
    usagePct: number;
  };
  
  type ThresholdAlertMessage = {
    type: "threshold_alert";
    yearMonth: string;
    threshold: 50 | 80 | 100;
    spent: number;
    budget: number;
    usagePct: number;
    firedAt: string; // ISO timestamp
    replay: boolean; // true = re-sent on reconnect, not a new notification
  };
  ```

**Why separate commit:** Establishes the WS foundation. Everything else depends on this working.

### Commit 2: Alert state store + useWsAlerts hook
**What:** Manage alert notifications (toasts + persistent banner) and dispatch logic.  
**Files:**
- `client/src/state/alertStore.ts` — Zustand store (or simple Context if preferred):
  ```ts
  type Alert = {
    id: string;
    yearMonth: string;
    threshold: 50 | 80 | 100;
    spent: number;
    budget: number;
    usagePct: number;
    firedAt: string;
    acknowledged: boolean;
  };
  
  const alertStore = {
    alerts: Alert[],
    addAlert(alert: Alert),
    acknowledgeAlert(id: string),
    clearAlert(id: string),
  };
  ```
- `client/src/ws/useWsAlerts.ts` — hook that:
  - Calls `useWsConnection()` to get the socket.
  - Subscribes to the current month (read from the Dashboard's month picker state or `useSearchParams()`).
  - Listens for `budget_status` messages → updates React Query cache for `['budget', yearMonth]` (so Dashboard re-renders automatically).
  - Listens for `threshold_alert` messages → adds to alert store (Zustand/Context).
  - Sends `subscribe { yearMonth }` on mount + whenever yearMonth changes.
  - Sends `acknowledge_alert { yearMonth, threshold }` when user dismisses an alert.
  - Returns `{ alerts, acknowledgeAlert }` for components to render.

**Why separate commit:** Alert state is distinct from the connection. Reviewable independently.

### Commit 3: Toast notifications + persistent alert banner
**What:** UI for displaying alerts (bottom-right toasts that auto-dismiss + top banner for persistent critical alerts).  
**Files:**
- `client/src/components/alerts/ToastContainer.tsx` — renders list of toasts in bottom-right corner:
  - Maps over `alerts.filter(a => !a.acknowledged)`.
  - Each toast shows: "📊 Spending at {threshold}% — ${spent} / ${budget}".
  - Auto-dismiss after 5 seconds OR user clicks the X.
  - Click → sends `acknowledge_alert` message to backend (prevents re-fire on reconnect).
  - CSS: fixed position, z-index 9999, slide-in animation, fade-out on dismiss.
- `client/src/components/alerts/AlertBanner.tsx` — persistent top banner for unacknowledged 100% threshold alerts:
  - Only shows if an alert with `threshold === 100` exists and not acknowledged.
  - Sticky at the top of the page (under header).
  - Text: "⚠️ Budget limit reached: ${spent} / ${budget}. Dismiss to acknowledge."
  - Dismiss button → sends `acknowledge_alert` to backend.
  - Background: warn color (e.g., `var(--color-warn)`), text white.
- Update `client/src/components/layout/AppShell.tsx` — add `<AlertBanner />` and `<ToastContainer />` at the root level (these consume the alert store/hook).

**Why separate commit:** UI can be polished independently. Once connection/store/hook work, this is purely visual.

### Commit 4 (optional): Test WebSocket flow end-to-end
**What:** Verify threshold alerts fire correctly in browser (manual test steps documented).  
**Files:**
- Update `RUN_LOCALLY.md` with new section: **Testing Real-Time Alerts**
  ```
  ## Testing Real-Time Alerts
  
  1. Start the app: `npm run dev`
  2. Create a budget: Dashboard → "No budget set" → create budget, e.g., $100
  3. Create transactions to cross thresholds:
     - Add $50 transaction → Dashboard updates to 50% (no alert yet unless you have 50% threshold enabled)
     - Add $30 more → 80% → see toast notification "Spending at 80%"
     - Add $20 more → 100% → see 100% toast AND persistent banner at top
  4. Verify "fires once per month":
     - Delete the $20 transaction → spending drops to 80% → banner disappears, no new 80% toast
     - Add $20 back → no new 100% toast (already fired this month, acknowledged persists in DB)
  5. Refresh the page → 100% banner reappears (unacknowledged alerts replay on reconnect)
  6. Click "Dismiss" → sends `acknowledge_alert` to backend → banner disappears and stays gone (DB marks as acknowledged)
  ```

**Why separate commit:** Documentation only. Makes Stage 4 verification repeatable.

---

## Key Implementation Details

### WebSocket Message Flow

**Client → Server (on connection upgrade):**
- Browser connects to `ws://localhost:3001/ws`
- Sends httpOnly JWT cookie automatically (browser behavior)
- Backend parses cookie, verifies JWT, rejects with 401 if invalid
- If valid, tagged socket with `userId` + `subscribedMonth` (defaults to current month)

**Client subscribes to a month:**
```ts
socket.send(JSON.stringify({
  type: "subscribe",
  yearMonth: "2026-09"
}));
```

**Server → Client on `budget_status`:**
Sent whenever a transaction/budget changes for that month:
```ts
{
  type: "budget_status",
  yearMonth: "2026-09",
  hasBudget: true,
  budget: 100,
  spent: 85,
  remaining: 15,
  usagePct: 85
}
```

**Server → Client on `threshold_alert`:**
Fired when crossing 50%, 80%, 100% (once per month per threshold):
```ts
{
  type: "threshold_alert",
  yearMonth: "2026-09",
  threshold: 80,
  spent: 85,
  budget: 100,
  usagePct: 85,
  firedAt: "2026-09-22T10:30:45Z",
  replay: false  // true = re-sent on reconnect, not a new event
}
```

**Client → Server on alert acknowledge:**
```ts
socket.send(JSON.stringify({
  type: "acknowledge_alert",
  yearMonth: "2026-09",
  threshold: 80
}));
```

### Integration with React Query Cache

When `budget_status` arrives, push directly into the React Query cache so the Dashboard re-renders without an extra fetch:

```ts
if (message.type === "budget_status") {
  queryClient.setQueryData(
    ["budget", message.yearMonth],
    {
      hasBudget: message.hasBudget,
      amount: message.budget,
      currency: userCurrency, // from app state
      spent: message.spent,
      remaining: message.remaining,
      usagePct: message.usagePct,
    }
  );
}
```

This ensures the Dashboard's budget cards update in real-time without polling.

---

## Architecture Rules (Enforce These)

1. **WsProvider is a singleton.** Mounted at root, NOT created per-component.
2. **No direct socket access in components.** Use `useWsAlerts()` hook instead.
3. **Alert state is normalized.** Store alerts by `(yearMonth, threshold)` key to avoid duplicates.
4. **Reconnection is automatic.** User doesn't need to think about it; socket reconnects silently.
5. **`replay: true` alerts are idempotent.** Show toast, but don't re-trigger notifications on reconnect.

---

## Testing for Stage 4

**Manual in-browser flow:**
1. Start app with `npm run dev`.
2. Create budget ($100).
3. Add transactions progressively:
   - $50 → Dashboard shows 50%, no alert (assuming only tracking 80/100)
   - $30 more ($80 total) → Toast: "Spending at 80%"
   - $20 more ($100 total) → Toast: "Spending at 100%" + Persistent banner at top
4. Delete the $20 → Spending drops to 80%, banner disappears, no new 80% toast (already fired this month).
5. Add $20 back → No new 100% toast (same month, same threshold, already fired).
6. Refresh page → 100% banner reappears (unacknowledged alerts replay on reconnect).
7. Click "Dismiss" on banner → disappears permanently (acknowledged in DB).
8. Open two browser windows as different users, create budgets for each, verify alerts are isolated (User A's alerts don't appear in User B's window).

**Backend verification:** Already tested in `ws-alerts.test.ts`, so no new backend tests needed.

---

## Files to Create/Update

**New files:**
- `client/src/ws/WsProvider.tsx`
- `client/src/ws/useWsConnection.ts`
- `client/src/ws/useWsAlerts.ts`
- `client/src/ws/types.ts`
- `client/src/state/alertStore.ts` (or use Context instead of Zustand)
- `client/src/components/alerts/ToastContainer.tsx`
- `client/src/components/alerts/AlertBanner.tsx`

**Update files:**
- `client/src/main.tsx` — wrap app with `WsProvider` (after `QueryClientProvider`).
- `client/src/components/layout/AppShell.tsx` — add `<AlertBanner />` and `<ToastContainer />`.
- `RUN_LOCALLY.md` — add "Testing Real-Time Alerts" section.

---

## Common Gotchas

1. **WebSocket is not authenticated by default.** Backend must verify the JWT from the cookie on the `upgrade` event — this is already done in `server/src/ws/server.ts`, so you don't need to change the backend.
2. **Browser auto-sends cookies on WebSocket upgrade if domain matches.** No manual JWT token passing needed — just trust that the backend verified it.
3. **Alert toast auto-dismiss shouldn't fire twice.** Set a flag so the same alert isn't rendered in multiple toasts.
4. **Month picker changes should re-subscribe.** If user picks a different month on Dashboard, the hook should send a new `subscribe` message to get alerts for that month.
5. **Acknowledge should be sent before the modal closes.** Otherwise, a quick reconnect might re-send the same alert.

---

## Git Workflow

- Commit 1: `WsProvider + useWsConnection` — foundation.
- Commit 2: `alert store + useWsAlerts hook` — state/logic.
- Commit 3: `Toast + Banner UI` — visual layer.
- Commit 4 (optional): `RUN_LOCALLY.md` test section.

Each commit should be tested in the browser before committing.

---

## Reference Code (from backend — understand this first)

**Backend WebSocket setup** (`server/src/ws/server.ts`):
- Listens on `/ws`.
- On `upgrade`, parses JWT from cookie, rejects with 401 if invalid.
- Otherwise calls `connectionManager.addConnection(userId, socket)`.

**Backend alert recompute** (`server/src/services/alert.service.ts`):
- Runs whenever a transaction/budget changes.
- Checks if `ThresholdAlertState` row exists for `(userId, yearMonth, threshold)`.
- If not, creates it, broadcasts `threshold_alert` message to that user's socket.
- If already exists (same month, same threshold), no-op (silent — fires once per month).

**Backend message sending** (`server/src/ws/handlers.ts`):
- `connectionManager.sendToUser(userId, message)` — sends to all that user's sockets.
- Uses the query cache approach: whenever budget status changes, broadcasts `budget_status` to all subscribed clients for that month.

---

## Handoff Checklist

When starting Stage 4:

- [ ] Read this file (`STAGE4_CONTEXT.md`).
- [ ] Run `npm run dev` to verify Stage 3 still works.
- [ ] Verify backend WebSocket is running: open DevTools → Network tab → filter by "WS", refresh page (should see `/ws` connection).
- [ ] Start with Commit 1: `WsProvider + useWsConnection` (foundation).
- [ ] Test each commit in the browser before moving to the next.
- [ ] Once all 4 commits are done, run the end-to-end manual test above.

---

## What Comes After Stage 4?

**Stage 5 — Polish:**
- Run full backend test suite one more time.
- Fix any data isolation edge cases found during CRUD testing.
- Optional: Add optional Dockerfiles for running the whole stack in containers.
- Write a final README / setup guide if needed.
- Tag release v0.1.0 and call it done.

---

**You're in the home stretch! WebSocket alerts are the final piece of the MVP. Once this is done, CapTrack is feature-complete.**
