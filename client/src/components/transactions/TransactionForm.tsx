import { useState } from 'react';
import { Category } from '../../types';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: {
    categoryId: string;
    title: string;
    amount: string;
    currency: string;
    date: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
  initialData?: {
    categoryId: string;
    title: string;
    amount: string;
    currency: string;
    date: string;
    notes?: string;
  };
}

export function TransactionForm({
  categories,
  onSubmit,
  isLoading,
  initialData,
}: TransactionFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      categoryId: '',
      title: '',
      amount: '',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be positive';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Transaction title"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: errors.title ? '2px solid #dc2626' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
        />
        {errors.title && (
          <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }}>
            {errors.title}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Category *
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: errors.categoryId ? '2px solid #dc2626' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }}>
            {errors.categoryId}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          >
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: errors.amount ? '2px solid #dc2626' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
          {errors.amount && (
            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }}>
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          >
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Date *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: errors.date ? '2px solid #dc2626' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
        />
        {errors.date && (
          <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }}>
            {errors.date}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
            minHeight: '80px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.5 : 1,
          fontSize: '1rem',
          fontWeight: '500',
        }}
      >
        {isLoading ? 'Saving...' : 'Save Transaction'}
      </button>
    </form>
  );
}
