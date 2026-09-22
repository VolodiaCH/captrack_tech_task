import { useState } from 'react';
import { useMe } from '../hooks/useMe';
import { useBudget, useCreateOrUpdateBudget } from '../hooks/useBudget';
import {
  getCurrentYearMonth,
  getPreviousYearMonth,
  getNextYearMonth,
  formatYearMonth,
} from '../utils/dateUtils';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useWsAlerts } from '../ws/useWsAlerts';

export default function Dashboard() {
  const { data: user } = useMe();
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const { data: budget, isLoading } = useBudget(yearMonth);
  const createOrUpdateBudget = useCreateOrUpdateBudget();
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  useWsAlerts(yearMonth);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetAmount) return;
    await createOrUpdateBudget.mutateAsync({
      yearMonth,
      data: {
        amount: parseFloat(newBudgetAmount),
        currency: user?.defaultCurrency || 'USD',
      },
    });
    setNewBudgetAmount('');
  };

  const handlePreviousMonth = () => setYearMonth(getPreviousYearMonth(yearMonth));
  const handleNextMonth = () => setYearMonth(getNextYearMonth(yearMonth));

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        Dashboard — Budget & Financial Overview
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius)',
        }}
      >
        <button
          onClick={handlePreviousMonth}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          ← Previous
        </button>
        <h2 style={{ margin: 0 }}>{formatYearMonth(yearMonth)}</h2>
        <button
          onClick={handleNextMonth}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : budget?.hasBudget ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Budget
            </p>
            <h3 style={{ margin: 'var(--spacing-sm) 0 0 0' }}>
              {budget.currency} {budget.budget}
            </h3>
          </div>

          <div
            style={{
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Spent
            </p>
            <h3 style={{ margin: 'var(--spacing-sm) 0 0 0' }}>
              {budget.currency} {budget.spent}
            </h3>
          </div>

          <div
            style={{
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Remaining
            </p>
            <h3 style={{ margin: 'var(--spacing-sm) 0 0 0' }}>
              {budget.currency} {budget.remaining}
            </h3>
          </div>

          <div
            style={{
              gridColumn: 'span 3',
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Usage
            </p>
            <div
              style={{
                width: '100%',
                height: '24px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(budget.usagePct || 0, 100)}%`,
                  backgroundColor:
                    (budget.usagePct || 0) > 100
                      ? '#dc2626'
                      : (budget.usagePct || 0) > 80
                        ? '#f59e0b'
                        : '#10b981',
                }}
              />
            </div>
            <p
              style={{
                margin: 'var(--spacing-sm) 0 0 0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              {(budget.usagePct || 0).toFixed(1)}% of budget used
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No budget set for {formatYearMonth(yearMonth)}
          </p>
          <form onSubmit={handleCreateBudget} style={{ marginTop: 'var(--spacing-lg)' }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-sm)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                  }}
                >
                  Budget Amount ({user?.defaultCurrency || 'USD'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    minWidth: '150px',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!newBudgetAmount || createOrUpdateBudget.isPending}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  opacity: !newBudgetAmount || createOrUpdateBudget.isPending ? 0.5 : 1,
                }}
              >
                Create Budget
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--spacing-2xl)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius)',
          borderLeft: '4px solid var(--color-primary)',
        }}
      >
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>✅ Phase 2 Complete!</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          You've successfully logged in using OAuth. Your session is secure and will persist across page refreshes.
        </p>
        <ul style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
          <li>✓ OAuth authentication (Google/GitHub)</li>
          <li>✓ Session persistence with JWT cookies</li>
          <li>✓ Protected routes and auth guards</li>
          <li>✓ Responsive layout and styling</li>
          <li>✓ Common UI components library</li>
        </ul>
        <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
          <strong>Next:</strong> Phase 3 will add budget calculations, transaction management, and category handling.
        </p>
      </div>
    </div>
  );
}
