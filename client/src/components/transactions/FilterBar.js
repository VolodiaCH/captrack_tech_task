import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FilterBar({ categories, onFiltersChange, filters }) {
    const handleSearchChange = (search) => {
        onFiltersChange({ ...filters, search: search || undefined });
    };
    const handleCategoryChange = (categoryId) => {
        onFiltersChange({ ...filters, categoryId: categoryId || undefined });
    };
    const handleDateRangeChange = (dateRange) => {
        const newFilters = { ...filters, dateRange: undefined, startDate: undefined, endDate: undefined };
        if (dateRange === 'thisMonth' || dateRange === 'lastMonth' || dateRange === 'custom') {
            newFilters.dateRange = dateRange;
        }
        onFiltersChange(newFilters);
    };
    const handleMinAmountChange = (amount) => {
        onFiltersChange({ ...filters, minAmount: amount ? parseFloat(amount) : undefined });
    };
    const handleMaxAmountChange = (amount) => {
        onFiltersChange({ ...filters, maxAmount: amount ? parseFloat(amount) : undefined });
    };
    const handleClearFilters = () => {
        onFiltersChange({});
    };
    return (_jsx("div", { style: {
            backgroundColor: 'var(--color-bg-secondary)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--spacing-lg)',
        }, children: _jsxs("div", { style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
            }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }, children: "Search" }), _jsx("input", { type: "text", value: filters.search || '', onChange: (e) => handleSearchChange(e.target.value), placeholder: "Search transactions...", style: {
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                boxSizing: 'border-box',
                            } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }, children: "Category" }), _jsxs("select", { value: filters.categoryId || '', onChange: (e) => handleCategoryChange(e.target.value), style: {
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                boxSizing: 'border-box',
                            }, children: [_jsx("option", { value: "", children: "All categories" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }, children: "Date Range" }), _jsxs("select", { value: filters.dateRange || '', onChange: (e) => handleDateRangeChange(e.target.value), style: {
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                boxSizing: 'border-box',
                            }, children: [_jsx("option", { value: "", children: "All time" }), _jsx("option", { value: "thisMonth", children: "This month" }), _jsx("option", { value: "lastMonth", children: "Last month" }), _jsx("option", { value: "custom", children: "Custom range" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }, children: "Min Amount" }), _jsx("input", { type: "number", step: "0.01", value: filters.minAmount || '', onChange: (e) => handleMinAmountChange(e.target.value), placeholder: "0", style: {
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                boxSizing: 'border-box',
                            } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }, children: "Max Amount" }), _jsx("input", { type: "number", step: "0.01", value: filters.maxAmount || '', onChange: (e) => handleMaxAmountChange(e.target.value), placeholder: "999999", style: {
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                boxSizing: 'border-box',
                            } })] }), _jsx("div", { style: { display: 'flex', alignItems: 'flex-end' }, children: _jsx("button", { onClick: handleClearFilters, style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            color: 'var(--color-text)',
                        }, children: "Clear filters" }) })] }) }));
}
