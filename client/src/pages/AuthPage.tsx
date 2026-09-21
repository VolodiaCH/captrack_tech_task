const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function AuthPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-bg-secondary)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: 'var(--spacing-2xl)',
        }}
      >
        <h1>Welcome to CapTrack</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Sign in to manage your expenses
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              borderRadius: 'var(--radius)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-secondary)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            Continue with Google
          </button>

          <button
            onClick={handleGithubLogin}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              borderRadius: 'var(--radius)',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111827';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f2937';
            }}
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
