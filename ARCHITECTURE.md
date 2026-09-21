# CapTrack Architecture & Design Patterns

This document details architectural patterns and provides concrete examples for maintaining modularity and SOLID principles across CapTrack.

---

## Pattern 1: Service Layer (Dependency Inversion)

**Problem:** A component needs to fetch data. Where should the API call live?

**Wrong:**
```typescript
// ❌ Component directly calls API
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    fetch('/api/transactions').then(r => r.json()).then(setTransactions);
  }, []);
  return <div>{transactions.map(...)}</div>;
};
```

**Why it's wrong:**
- Component has side effects (hard to test)
- Tight coupling to HTTP (hard to swap)
- No caching (refetches on every render)
- Data fetching logic scattered across components

**Right:**
```typescript
// ✅ Hook owns data fetching
const useTransactions = () => {
  return useQuery(['transactions'], () => api.getTransactions());
};

// Component receives data
const TransactionList = ({ transactions }) => {
  return <div>{transactions.map(...)}</div>;
};

// Page orchestrates
const TransactionsPage = () => {
  const { data: transactions, isLoading } = useTransactions();
  if (isLoading) return <LoadingSpinner />;
  return <TransactionList transactions={transactions} />;
};
```

**Why it's right:**
- Hook can be tested with a mock `api`
- Component is pure (same props → same output)
- Caching is automatic (React Query)
- Easy to extend (add a filter, add a sort)

---

## Pattern 2: Strategy Pattern (Open/Closed)

**Problem:** We support multiple OAuth providers. Adding a new one shouldn't require editing existing code.

**Wrong (Closed to Extension):**
```typescript
// ❌ Auth route checks provider type
router.get('/callback/:provider', async (req, res) => {
  if (req.params.provider === 'google') {
    // ... google logic
  } else if (req.params.provider === 'github') {
    // ... github logic
  } else if (req.params.provider === 'facebook') {
    // ... facebook logic (requires editing this file!)
  }
});
```

**Right (Open for Extension):**
```typescript
// Backend: Define the contract
// auth/providers/types.ts
export interface OAuthProvider {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<string>;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}

// Implementations implement the interface
// auth/providers/google.ts
export class GoogleOAuthProvider implements OAuthProvider { ... }

// auth/providers/facebook.ts (NEW FILE, no edits elsewhere!)
export class FacebookOAuthProvider implements OAuthProvider { ... }

// Registry lets you add new providers without touching routes
// auth/providers/index.ts
const providers = {
  google: new GoogleOAuthProvider(),
  github: new GitHubOAuthProvider(),
  facebook: new FacebookOAuthProvider(), // Just add here
};

export function getProvider(name: string) {
  return providers[name];
}

// Route works with any provider (closed for modification)
// routes/auth.routes.ts
router.get('/callback/:provider', async (req, res) => {
  const provider = getProvider(req.params.provider);
  const accessToken = await provider.exchangeCodeForToken(code);
  const profile = await provider.fetchProfile(accessToken);
  // ... same logic for all providers
});
```

**Key insight:** The route doesn't change. New providers just implement the interface.

---

## Pattern 3: Dependency Injection (Inversion of Control)

**Problem:** Testing a service that calls another service is hard. How do we inject a fake for testing?

**Wrong (Hard-Coded Dependencies):**
```typescript
// ❌ alert.service.ts imports and calls budget.service directly
import * as budgetService from './budget.service';

export async function recomputeThresholds(userId: string, yearMonth: string) {
  const status = await budgetService.getBudgetStatus(userId, yearMonth);
  // ... compute thresholds
}

// Test can't inject a fake budgetService
it('should recompute thresholds', async () => {
  // Can't mock budgetService!
  const result = await recomputeThresholds('user1', '2026-09');
  expect(result).toContain(50); // Hits real DB!
});
```

**Right (Dependency Injection):**
```typescript
// ✅ alert.service.ts accepts dependencies as arguments
export async function recomputeThresholds(
  userId: string,
  yearMonth: string,
  getBudgetStatus: (userId: string, yearMonth: string) => Promise<BudgetStatus>
) {
  const status = await getBudgetStatus(userId, yearMonth);
  // ... compute thresholds
}

// In production, pass the real service
import * as budgetService from './budget.service';
const alerts = await recomputeThresholds(userId, yearMonth, budgetService.getBudgetStatus);

// In tests, pass a fake
it('should recompute thresholds', async () => {
  const fakeBudgetStatus = async () => ({
    hasBudget: true,
    budget: 100,
    spent: 50,
    usagePct: 50,
  });
  const result = await recomputeThresholds('user1', '2026-09', fakeBudgetStatus);
  expect(result).toContain(50); // No DB call!
});
```

**For the frontend**, use React Query's dependency injection via providers:

```typescript
// ✅ Provide a fake API in tests
const mockApi = {
  getTransactions: () => Promise.resolve([...]),
};

renderWithQuery(
  <QueryClientProvider client={testQueryClient}>
    <TransactionsPage />
  </QueryClientProvider>
);

// Real app provides real API
const realQueryClient = new QueryClient();
renderWithQuery(
  <QueryClientProvider client={realQueryClient}>
    <App />
  </QueryClientProvider>
);
```

---

## Pattern 4: Adapter Pattern (Implementing Interfaces)

**Problem:** We have a fetch API on the client and multiple API services. We want to swap implementations (mock in tests, real in production).

**Implementation:**
```typescript
// api/types.ts (the contract)
export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, data: any): Promise<T>;
  put<T>(path: string, data: any): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

// api/client.ts (real implementation)
export const realApiClient: ApiClient = {
  async get(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  },
  // ... etc
};

// test helpers (test implementation)
export const mockApiClient: ApiClient = {
  async get(path) {
    if (path === '/api/transactions') return mockTransactions;
    throw new Error('Not mocked');
  },
  // ... etc
};

// Hooks accept the API as a dependency
const useTransactions = (api: ApiClient = realApiClient) => {
  return useQuery(['transactions'], () => api.get('/api/transactions'));
};

// Production: implicit use of realApiClient
const TransactionsPage = () => {
  const { data } = useTransactions(); // Uses realApiClient
};

// Tests: explicit use of mockApiClient
it('should load transactions', async () => {
  const { data } = renderHook(() => useTransactions(mockApiClient));
  expect(data).toEqual(mockTransactions);
});
```

---

## Pattern 5: Factory Pattern (Decoupling Creation)

**Problem:** Components shouldn't need to know how to create services or validators. Centralize creation.

**Example: Zod Schema Factory**
```typescript
// validation/formSchemas.ts (centralized)
export const createTransactionSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  date: z.string().datetime(),
  categoryId: z.string().min(1),
  notes: z.string().optional(),
});

// Components don't create schemas; they use them
const TransactionForm = ({ onSubmit }) => {
  const handleSubmit = (formData) => {
    const validated = createTransactionSchema.parse(formData);
    onSubmit(validated);
  };
  return <form onSubmit={handleSubmit}>...</form>;
};
```

**Example: Hook Factory**
```typescript
// hooks/useApi.ts (factory for query hooks)
export function useApiQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery(key, fetcher, {
    staleTime: 5 * 60 * 1000, // 5 min default
    cacheTime: 10 * 60 * 1000, // 10 min default
    retry: 1,
    ...options,
  });
}

// Specific hooks reuse the factory
export const useTransactions = () =>
  useApiQuery(['transactions'], () => api.get('/api/transactions'));

export const useBudget = (yearMonth: string) =>
  useApiQuery(
    ['budget', yearMonth],
    () => api.get(`/api/budgets/${yearMonth}`),
    { enabled: !!yearMonth }
  );
```

---

## Pattern 6: Composition Over Inheritance

**Problem:** We have a Button component. How do we reuse it for different uses (primary, danger, loading state)?

**Wrong (Over-Engineered Inheritance):**
```typescript
// ❌ Long inheritance chain
class BaseButton { ... }
class PrimaryButton extends BaseButton { ... }
class PrimaryLoadingButton extends PrimaryButton { ... }
// Now add danger variants... ugh
```

**Right (Composition with Props):**
```typescript
// ✅ Single Button component, composed with variants
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  onClick,
  children,
}: ButtonProps) => {
  const baseClass = 'px-4 py-2 rounded font-semibold';
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];

  return (
    <button
      className={`${baseClass} ${variantClass}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

// Use it anywhere
<Button variant="primary">Save</Button>
<Button variant="danger" isLoading={deleting}>Delete</Button>
```

**Key insight:** Composition is more flexible than inheritance.

---

## Pattern 7: Container vs. Presentational Components

**Problem:** Components have too many responsibilities. How do we separate concerns?

**Pattern:**
```typescript
// ✅ Container (business logic)
// pages/TransactionsPage.tsx
const TransactionsPage = () => {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const [filter, setFilter] = useState<Filter>({ search: '' });

  const filtered = transactions?.filter(t =>
    t.title.includes(filter.search)
  ) || [];

  return (
    <TransactionsContainer
      transactions={filtered}
      categories={categories}
      isLoading={isLoading}
      onFilterChange={setFilter}
    />
  );
};

// ✅ Presentational (just JSX)
// components/transactions/TransactionsContainer.tsx
const TransactionsContainer = ({
  transactions,
  categories,
  isLoading,
  onFilterChange,
}: TransactionsContainerProps) => {
  return (
    <div>
      <FilterBar onFilterChange={onFilterChange} />
      {isLoading ? <Spinner /> : <TransactionsTable transactions={transactions} />}
    </div>
  );
};

// ✅ Small presentational piece
// components/transactions/TransactionsTable.tsx
const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <table>
      {transactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
    </table>
  );
};
```

**Rule of thumb:**
- **Container:** knows about state, fetches data, passes props to presentational components
- **Presentational:** receives data via props, renders JSX, calls callbacks

---

## Pattern 8: Custom Hooks for Shared Logic

**Problem:** Multiple components need the same data or logic. Avoid duplication.

**Example: Form Handling Hook**
```typescript
// hooks/useForm.ts
export function useForm<T>(initialValues: T, onSubmit: (values: T) => Promise<void>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, handleChange, handleSubmit, setValues };
}

// Usage in TransactionForm
const TransactionForm = ({ categoryId, onSuccess }) => {
  const { mutate: createTransaction } = useCreateTransaction();
  const form = useForm(
    { title: '', amount: 0, date: new Date() },
    async (values) => {
      await createTransaction({ ...values, categoryId });
      onSuccess?.();
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input name="title" value={form.values.title} onChange={form.handleChange} />
      {form.errors.title && <span className="error">{form.errors.title}</span>}
      <button type="submit" disabled={form.isSubmitting}>Save</button>
    </form>
  );
};
```

---

## Pattern 9: Error Handling at Boundaries

**Problem:** Errors happen everywhere. Where do we catch and handle them?

**Backend:**
```typescript
// ❌ Avoid try-catch in every route
router.post('/transactions', async (req, res) => {
  try {
    const txn = await createTransaction(...);
    res.json(txn);
  } catch (err) {
    // Error handling duplicated in every route!
  }
});

// ✅ Use error middleware
router.post('/transactions', async (req, res, next) => {
  try {
    const txn = await createTransaction(...);
    res.json(txn);
  } catch (err) {
    next(err); // Pass to error middleware
  }
});

// middleware/errorHandler.ts
app.use((err, req, res, next) => {
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'Unique constraint violation' });
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal error' });
  }
});
```

**Frontend:**
```typescript
// ❌ Avoid try-catch in components
const TransactionForm = () => {
  const handleSubmit = async (data) => {
    try {
      await api.post('/transactions', data);
    } catch (err) {
      setError(err.message); // Repeated in every form
    }
  };
};

// ✅ Error handling in hooks and React Query
const useCreateTransaction = () => {
  return useMutation(api.postTransaction, {
    onError: (err) => {
      // Centralized error handling
      showToast(`Failed: ${err.message}`, 'error');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
    },
  });
};

// Component just uses the mutation
const TransactionForm = () => {
  const { mutate, isLoading } = useCreateTransaction();
  const handleSubmit = (data) => mutate(data); // No error handling here!
};
```

---

## Pattern 10: State Management Hierarchy

**Problem:** Too much state, scattered across components. How do we manage complex state?

**Hierarchy (Prefer Each Level):**

1. **Local component state** (`useState`) — button toggle, form input
2. **URL state** (`useSearchParams`) — filters, page number (shareable, bookmarkable)
3. **React Query cache** — server state (transactions, budgets, users)
4. **Context** — theme, authenticated user, global alerts
5. **Zustand store** — complex cross-page state (only if really needed)

```typescript
// ❌ Mixing levels
const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]); // Should be React Query!
  const [filter, setFilter] = useState(''); // Should be URL params!
  const [theme, setTheme] = useState('light'); // Should be Context!
};

// ✅ Each level for its purpose
const TransactionsPage = () => {
  // 1. URL state (shareable)
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  // 2. Server state (React Query)
  const { data: transactions } = useTransactions({ search });

  // 3. Context (user, theme, auth)
  const { user } = useAuth();
  const { theme } = useTheme();

  // 4. Local state (UI only)
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <SearchInput value={search} onChange={v => setSearchParams({ search: v })} />
      <TransactionsTable transactions={transactions} />
      <Modal open={isModalOpen}><CreateTransactionForm /></Modal>
    </div>
  );
};
```

---

## Quick Reference: When to Use What

| Problem | Pattern | Example |
|---------|---------|---------|
| Multiple implementations of same interface | Strategy | OAuth providers |
| Creating complex objects | Factory | Zod schemas, hooks |
| Reducing prop drilling | Context or React Query | Theme, auth, server state |
| Component has data + rendering | Container/Presentational | Page + reusable component |
| Shared non-rendering logic | Custom Hook | Form handling, data fetching |
| Multiple constructor variants | Composition | Button with variant props |
| Decoupling from concrete types | Dependency Injection | Pass service as arg or hook dependency |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| God Component | Does everything | Split by concern |
| Prop Drilling | Pass props through many levels | Use Context, React Query, or custom hook |
| Hard-Coded Dependencies | Can't test or swap | Inject via args or hooks |
| Mixing Business & UI Logic | Hard to reuse | Separate into hook + component |
| Circular Imports | Builds fail or break at runtime | Reorganize: direction is routes → services → models |
| Long Parameter Lists | Function signature is unclear | Object param or curried functions |
| Comments Explaining Code | Code isn't clear | Rename variables/functions |
| Catching All Errors Silently | Silent failures | Log and/or display to user |

