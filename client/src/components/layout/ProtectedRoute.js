import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
export function ProtectedRoute({ children }) {
    const { data: user, isLoading, isError } = useMe();
    if (isLoading) {
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }, children: _jsx("div", { children: "Loading..." }) }));
    }
    if (isError || !user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
