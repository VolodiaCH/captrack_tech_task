import { Category } from '../../types';
import { TransactionFilters } from '../../api/transactionsApi';

interface FilterBarProps {
  categories: Category[];
  onFiltersChange: (filters: TransactionFilters) => void;
  filters: TransactionFilters;
}

export function FilterBar({ categories, onFiltersChange, filters }: FilterBarProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, categoryId: categoryId || undefined });
  };

  const handleDateRangeChange = (dateRange: string) => {
    const newFilters: typeof filters = { ...filters, dateRange: undefined, startDate: undefined, endDate: undefined };
    if (dateRange === 'thisMonth' || dateRange === 'lastMonth' || dateRange === 'custom') {
      newFilters.dateRange = dateRange;
    }
    onFiltersChange(newFilters);
  };

  const handleMinAmountChange = (amount: string) => {
    onFiltersChange({ ...filters, minAmount: amount ? parseFloat(amount) : undefined });
  };

  const handleMaxAmountChange = (amount: string) => {
    onFiltersChange({ ...filters, maxAmount: amount ? parseFloat(amount) : undefined });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius)',
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Search
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search transactions..."
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Category
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
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
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Date Range
          </label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) => handleDateRangeChange(e.target.value)}
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
            <option value="">All time</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Min Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={filters.minAmount || ''}
            onChange={(e) => handleMinAmountChange(e.target.value)}
            placeholder="0"
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Max Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={filters.maxAmount || ''}
            onChange={(e) => handleMaxAmountChange(e.target.value)}
            placeholder="999999"
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleClearFilters}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}
