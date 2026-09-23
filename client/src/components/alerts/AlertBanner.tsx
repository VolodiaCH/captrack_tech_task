import { useMemo } from 'react';
import { useAlertStore } from '../../state/alertStore';
import { useWsConnection } from '../../ws/useWsConnection';
import { ClientMessage } from '../../ws/types';
import './AlertBanner.css';

export function AlertBanner() {
  const allAlerts = useAlertStore((state: any) => state.alerts);
  const { socket, isConnected } = useWsConnection();

  const alert = useMemo(
    () => {
      const unacknowledged = allAlerts.filter(
        (a: any) => !a.acknowledged && a.threshold === 100
      );
      return unacknowledged.length > 0 ? unacknowledged[0] : null;
    },
    [allAlerts]
  );

  if (!alert) return null;

  const handleDismiss = () => {
    if (socket && isConnected) {
      const message: ClientMessage = {
        type: 'acknowledge_alert',
        yearMonth: alert.yearMonth,
        threshold: 100,
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
    <div className="alert-banner">
      <div className="alert-banner-content">
        <span className="alert-banner-emoji">⚠️</span>
        <p className="alert-banner-text">
          Budget limit reached: {alert.spent.toFixed(2)} / {alert.budget.toFixed(2)}
        </p>
      </div>
      <button
        className="alert-banner-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
