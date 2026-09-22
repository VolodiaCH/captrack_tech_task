import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAlertStore } from '../../state/alertStore';
import { useWsConnection } from '../../ws/useWsConnection';
import './AlertBanner.css';
export function AlertBanner() {
    const alert = useAlertStore((state) => {
        const unacknowledged = state.alerts.filter((a) => !a.acknowledged && a.threshold === 100);
        return unacknowledged.length > 0 ? unacknowledged[0] : null;
    });
    const { socket, isConnected } = useWsConnection();
    if (!alert)
        return null;
    const handleDismiss = () => {
        if (socket && isConnected) {
            const message = {
                type: 'acknowledge_alert',
                yearMonth: alert.yearMonth,
                threshold: 100,
            };
            socket.send(JSON.stringify(message));
        }
        useAlertStore.setState((state) => ({
            alerts: state.alerts.map((a) => a.id === alert.id ? { ...a, acknowledged: true } : a),
        }));
    };
    return (_jsxs("div", { className: "alert-banner", children: [_jsxs("div", { className: "alert-banner-content", children: [_jsx("span", { className: "alert-banner-emoji", children: "\u26A0\uFE0F" }), _jsxs("p", { className: "alert-banner-text", children: ["Budget limit reached: ", alert.spent.toFixed(2), " / ", alert.budget.toFixed(2)] })] }), _jsx("button", { className: "alert-banner-dismiss", onClick: handleDismiss, "aria-label": "Dismiss", children: "Dismiss" })] }));
}
