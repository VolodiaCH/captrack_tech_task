import { useMe } from '../hooks/useMe';

export default function Dashboard() {
  const { data: user } = useMe();

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
        Dashboard (More features coming in Phase 3)
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
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
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Budget</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Coming in Phase 3...</p>
        </div>

        <div
          style={{
            padding: 'var(--spacing-lg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Transactions</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Coming in Phase 3...</p>
        </div>

        <div
          style={{
            padding: 'var(--spacing-lg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Categories</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Coming in Phase 3...</p>
        </div>
      </div>

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
