# Capgemini MVP: Personal Expense Tracker — Requirements & Acceptance Criteria

## 1. Core Rules
* **Multi-user Support:** The application must support multiple users.
* **Data Isolation:** Each user sees only their own data with zero cross-account sharing (no public links, shared budgets, or invites).
* **Local Run:** Tech stack, database, and UI libraries are flexible, but the application must run locally.

---

## 2. Functional Requirements

### 2.1 Accounts & Authentication (SSO Only)
* **Providers:** Google OAuth / OpenID Connect and GitHub OAuth.
* **Session Persistence:** Auth state must persist across page refreshes.
* **Logout:** Users must be able to log out securely.
* **Auto-Provisioning:** On first successful SSO sign-in, create a local user record containing:
  * `provider`
  * `provider_user_id`
  * `email` (if provided by provider)
  * `display_name`
  * `avatar_url` (optional)
* **Account Linking:** Not required. Google and GitHub accounts for the same email may be treated separately unless explicitly documented.

### 2.2 Categories
* Users can create, rename, and delete categories.
* Category names must be unique per user.
* **Deletion Policy:** Explicitly handle deletion by either:
  1. Blocking deletion if transactions exist, OR
  2. Reassigning transactions to a default category (e.g., "Uncategorized").
* The chosen strategy must be documented in the `README`.

### 2.3 Transactions (Expenses)
* Each transaction must belong to exactly one user and include:
  * Title (short description)
  * Amount (> 0)
  * Currency (explicitly declared in UI)
  * Transaction Date (valid date)
  * Category
  * Notes (optional)
* **Operations:** Create, Edit (all fields), Delete.

### 2.4 Monthly Budget
* Set a monthly budget amount for a selected month.
* **Calculations:**
  * Total Spent for selected month
  * Remaining Budget (`Budget - Spent`)
  * Budget Usage Percentage (`(Spent / Budget) * 100`)
* **State:** Display a clear "No budget set" UI state when no budget exists for the month.

### 2.5 Search & Filters
* **Search:** By title and notes.
* **Category Filter:** Filter by specific category.
* **Date Range Filter:** This month, last month, or custom date range.
* **Amount Range Filter:** Min / Max amount bounds.

### 2.6 Real-Time WebSocket Alerts
* **Server → Client (Threshold Alerts):**
  * Calculated strictly for the current calendar month.
  * Thresholds: **50%**, **80%**, and **100%**.
  * Each threshold fires at most **once per month** (rule applies even if transactions are edited/deleted later).
  * Triggered upon WebSocket connection open and after any transaction Create/Update/Delete.
  * Disabled if no monthly budget is set.
* **Client → Server (Bidirectional):**
  * Client must send at least one meaningful message that affects server behavior (e.g., `subscribe` or `acknowledge_alert`). Documented in `README`.
* **UI Presentation:** Toast notifications, alert banner, or notification panel.

---

## 3. UI & UX Requirements
* **Light Theme Only** (Dark mode not required).
* **Screens Required:**
  1. **Auth Screen:** Buttons for "Continue with Google" and "Continue with GitHub".
  2. **Dashboard:** Selected month metrics (Total Spent, Budget, Remaining, Usage %).
  3. **Transactions View:** Table/List with search, filter controls, and Create/Edit modal/drawer.
  4. **Categories Management UI**.
  5. **WebSocket Alert Displays**.
* **Interactivity & Quality Checks:**
  * Responsive layout (table-to-cards or horizontal scroll on mobile).
  * Hover and focus states for interactive controls.
  * Client-side form validation feedback.
  * Loading states during data fetching.
  * Clear Empty States for: No transactions, No categories, No search results, No budget set.

---

## 4. Quality & Technical Deliverables
* **Backend API:** Enforce authentication and user authorization on every HTTP route and WebSocket connection.
* **Automated Tests (No real network calls):**
  * Mocked SSO login path.
  * Category & Transaction creation.
  * Authorization isolation (prevent cross-user access).
  * Budget threshold WebSocket alerts (50%, 80%, 100%).
* **Deliverables:**
  * GitLab repository with full code.
  * Comprehensive `README` covering setup, testing, API routes, WebSocket message formats, OAuth configuration, and category deletion logic.
  * (Optional) `Dockerfile` / `docker-compose.yml`.

---

## 5. Acceptance Checklist
- [ ] User can sign in with Google and GitHub.
- [ ] Local user record is automatically created on first login.
- [ ] User can manage categories and transactions.
- [ ] User can set a monthly budget and see totals, remaining budget, and usage percentage.
- [ ] User can search and filter transactions.
- [ ] Data is strictly isolated per user.
- [ ] Real-time WebSocket alerts deliver 50%, 80%, and 100% threshold notifications for current month.
- [ ] WebSocket flow includes a client → server message that alters server state or behavior.
- [ ] App runs locally following `README` instructions.
- [ ] Automated tests pass locally.