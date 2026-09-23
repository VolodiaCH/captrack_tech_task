import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
export default function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(AppShell, { children: _jsx(Dashboard, {}) }) }) }), _jsx(Route, { path: "/transactions", element: _jsx(ProtectedRoute, { children: _jsx(AppShell, { children: _jsx(TransactionsPage, {}) }) }) }), _jsx(Route, { path: "/categories", element: _jsx(ProtectedRoute, { children: _jsx(AppShell, { children: _jsx(CategoriesPage, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx("div", { children: "404 Not Found" }) })] }) }));
}
