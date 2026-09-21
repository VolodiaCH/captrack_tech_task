interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {icon && <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>{icon}</div>}
      <h3 style={{ color: 'var(--color-text)' }}>{title}</h3>
      {description && <p style={{ marginBottom: action ? 'var(--spacing-lg)' : 0 }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
