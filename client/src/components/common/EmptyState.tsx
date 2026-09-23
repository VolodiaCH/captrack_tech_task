interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode | (() => void);
  actionLabel?: string;
}

export function EmptyState({ icon, title, description, action, actionLabel }: EmptyStateProps) {
  const actionNode = typeof action === 'function' ? (
    <button onClick={action} style={{ padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer' }}>
      {actionLabel || 'Action'}
    </button>
  ) : (
    action
  );

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
      {description && <p style={{ marginBottom: actionNode ? 'var(--spacing-lg)' : 0 }}>{description}</p>}
      {actionNode && <div>{actionNode}</div>}
    </div>
  );
}
