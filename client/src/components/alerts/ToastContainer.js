import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAlertStore } from '../../state/alertStore';
import { useWsConnection } from '../../ws/useWsConnection';
import './ToastContainer.css';
export function ToastContainer() {
    const alerts = useAlertStore((state) => state.alerts.filter((a) => !a.acknowledged));
    const { socket, isConnected } = useWsConnection();
    const handleDismiss = (alert) => {
        if (socket && isConnected) {
            const message = {
                type: 'acknowledge_alert',
                yearMonth: alert.yearMonth,
                threshold: alert.threshold,
            };
            socket.send(JSON.stringify(message));
        }
        useAlertStore.setState((state) => ({
            alerts: state.alerts.map((a) => a.id === alert.id ? { ...a, acknowledged: true } : a),
        }));
    };
    return (_jsx("div", { className: "toast-container", children: alerts.map((alert) => (_jsxs("div", { className: "toast toast-enter", children: [_jsxs("div", { className: "toast-content", children: [_jsx("span", { className: "toast-emoji", children: "\uD83D\uDCCA" }), _jsxs("div", { className: "toast-text", children: [_jsxs("p", { className: "toast-title", children: ["Spending at ", alert.threshold, "%"] }), _jsxs("p", { className: "toast-message", children: [alert.spent.toFixed(2), " / ", alert.budget.toFixed(2)] })] })] }), _jsx("button", { className: "toast-close", onClick: () => handleDismiss(alert), "aria-label": "Dismiss", children: "\u2715" })] }, alert.id))) }));
}
