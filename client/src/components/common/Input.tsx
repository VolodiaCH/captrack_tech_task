interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...rest }: InputProps) {
  const inputId = rest.id || `input-${Math.random()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        style={{
          padding: 'var(--spacing-md)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 'var(--font-size-base)',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
        }}
        {...rest}
      />

      {error && (
        <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{error}</span>
      )}

      {hint && !error && (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}
