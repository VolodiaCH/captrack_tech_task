import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export default function AuthPage() {
    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    };
    const handleGithubLogin = () => {
        window.location.href = `${API_BASE_URL}/api/auth/github`;
    };
    return (_jsx("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
        }, children: _jsxs("div", { style: {
                textAlign: 'center',
                maxWidth: '400px',
                padding: 'var(--spacing-2xl)',
            }, children: [_jsx("h1", { children: "Welcome to CapTrack" }), _jsx("p", { style: { color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }, children: "Sign in to manage your expenses" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }, children: [_jsx("button", { onClick: handleGoogleLogin, style: {
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: '600',
                                borderRadius: 'var(--radius)',
                                backgroundColor: '#ffffff',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }, onMouseOver: (e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                            }, onMouseOut: (e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                            }, children: "Continue with Google" }), _jsx("button", { onClick: handleGithubLogin, style: {
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: '600',
                                borderRadius: 'var(--radius)',
                                backgroundColor: '#1f2937',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }, onMouseOver: (e) => {
                                e.currentTarget.style.backgroundColor = '#111827';
                            }, onMouseOut: (e) => {
                                e.currentTarget.style.backgroundColor = '#1f2937';
                            }, children: "Continue with GitHub" })] })] }) }));
}
