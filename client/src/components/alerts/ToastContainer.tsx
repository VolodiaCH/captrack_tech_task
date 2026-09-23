import { useMemo } from 'react';
import { useAlertStore } from '../../state/alertStore';
import { useWsConnection } from '../../ws/useWsConnection';
import { ClientMessage } from '../../ws/types';
import './ToastContainer.css';

const selectAllAlerts = (state: any) => state.alerts;

export function ToastContainer() {
  const allAlerts = useAlertStore(selectAllAlerts);
  const { socket, isConnected } = useWsConnection();

  const alerts = useMemo(
    () => allAlerts.filter((a: any) => !a.acknowledged),
    [allAlerts]
  );

  const handleDismiss = (alert: any) => {
    if (socket && isConnected) {
      const message: ClientMessage = {
        type: 'acknowledge_alert',
        yearMonth: alert.yearMonth,
        threshold: alert.threshold,
      };
      socket.send(JSON.stringify(message));
    }

    useAlertStore.setState((state: any) => ({
      alerts: state.alerts.map((a: any) =>
        a.id === alert.id ? { ...a, acknowledged: true } : a
      ),
    }));
  };

  return (
    <div className="toast-container">
      {alerts.map((alert: any) => (
        <div key={alert.id} className="toast toast-enter">
          <div className="toast-content">
            <span className="toast-emoji">📊</span>
            <div className="toast-text">
              <p className="toast-title">Spending at {alert.threshold}%</p>
              <p className="toast-message">
                {alert.spent.toFixed(2)} / {alert.budget.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            className="toast-close"
            onClick={() => handleDismiss(alert)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
