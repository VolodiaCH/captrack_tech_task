import { create } from 'zustand';
export const useAlertStore = create((set) => ({
    alerts: [],
    addAlert: (alert) => set((state) => {
        const id = `${alert.yearMonth}-${alert.threshold}`;
        const existing = state.alerts.find((a) => a.yearMonth === alert.yearMonth && a.threshold === alert.threshold);
        if (existing) {
            return {
                alerts: state.alerts.map((a) => a.id === existing.id ? { ...alert, id, acknowledged: false } : a),
            };
        }
        return {
            alerts: [...state.alerts, { ...alert, id }],
        };
    }),
    acknowledgeAlert: (id) => set((state) => ({
        alerts: state.alerts.map((a) => a.id === id ? { ...a, acknowledged: true } : a),
    })),
    clearAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
    })),
    clearAllAcknowledged: () => set((state) => ({
        alerts: state.alerts.filter((a) => !a.acknowledged),
    })),
}));
