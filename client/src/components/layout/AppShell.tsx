import { Link, useNavigate } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { authApi } from '../../api/authApi';
import { useState } from 'react';
import { AlertBanner } from '../alerts/AlertBanner';
import { ToastContainer } from '../alerts/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { data: user } = useMe();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AlertBanner />
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          backgroundColor: 'var(--color-bg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>
            <Link to="/dashboard" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
              CapTrack
            </Link>
          </h1>

          <nav style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ color: 'inherit' }}>
              Dashboard
            </Link>
            <Link to="/transactions" style={{ color: 'inherit' }}>
              Transactions
            </Link>
            <Link to="/categories" style={{ color: 'inherit' }}>
              Categories
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {user?.displayName}
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-danger)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  opacity: isLoggingOut ? 0.6 : 1,
                }}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>{children}</div>
      </main>

      <ToastContainer />
    </div>
  );
}
