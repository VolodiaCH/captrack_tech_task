import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { authApi } from '../../api/authApi';
import { useState } from 'react';
import { AlertBanner } from '../alerts/AlertBanner';
import { ToastContainer } from '../alerts/ToastContainer';
export function AppShell({ children }) {
    const { data: user } = useMe();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await authApi.logout();
            navigate('/login');
        }
        catch (err) {
            console.error('Logout failed:', err);
        }
        finally {
            setIsLoggingOut(false);
        }
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: [_jsx(AlertBanner, {}), _jsx("header", { style: {
                    borderBottom: '1px solid var(--color-border)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: 'var(--color-bg)',
                    boxShadow: 'var(--shadow-sm)',
                }, children: _jsxs("div", { style: {
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }, children: [_jsx("h1", { style: { fontSize: 'var(--font-size-xl)', margin: 0 }, children: _jsx(Link, { to: "/dashboard", style: { color: 'var(--color-text)', textDecoration: 'none' }, children: "CapTrack" }) }), _jsxs("nav", { style: { display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }, children: [_jsx(Link, { to: "/dashboard", style: { color: 'inherit' }, children: "Dashboard" }), _jsx(Link, { to: "/transactions", style: { color: 'inherit' }, children: "Transactions" }), _jsx(Link, { to: "/categories", style: { color: 'inherit' }, children: "Categories" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }, children: [_jsx("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }, children: user?.displayName }), _jsx("button", { onClick: handleLogout, disabled: isLoggingOut, style: {
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                fontSize: 'var(--font-size-sm)',
                                                backgroundColor: 'var(--color-danger)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: 'var(--radius)',
                                                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                                                opacity: isLoggingOut ? 0.6 : 1,
                                            }, children: isLoggingOut ? 'Logging out...' : 'Logout' })] })] })] }) }), _jsx("main", { style: { flex: 1, padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-bg-secondary)' }, children: _jsx("div", { style: { maxWidth: '1200px', margin: '0 auto' }, children: children }) }), _jsx(ToastContainer, {})] }));
}
