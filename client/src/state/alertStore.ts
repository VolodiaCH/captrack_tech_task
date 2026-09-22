import { create } from 'zustand';

export type Alert = {
  id: string;
  yearMonth: string;
  threshold: 50 | 80 | 100;
  spent: number;
  budget: number;
  usagePct: number;
  firedAt: string;
  acknowledged: boolean;
};

interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlert: (id: string) => void;
  clearAllAcknowledged: () => void;
}

export const useAlertStore = create<AlertStore>((set: any) => ({
  alerts: [],
  addAlert: (alert: any) =>
    set((state: any) => {
      const id = `${alert.yearMonth}-${alert.threshold}`;
      const existing = state.alerts.find(
        (a: any) => a.yearMonth === alert.yearMonth && a.threshold === alert.threshold
      );

      if (existing) {
        return {
          alerts: state.alerts.map((a: any) =>
            a.id === existing.id ? { ...alert, id, acknowledged: false } : a
          ),
        };
      }

      return {
        alerts: [...state.alerts, { ...alert, id }],
      };
    }),
  acknowledgeAlert: (id: string) =>
    set((state: any) => ({
      alerts: state.alerts.map((a: any) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),
  clearAlert: (id: string) =>
    set((state: any) => ({
      alerts: state.alerts.filter((a: any) => a.id !== id),
    })),
  clearAllAcknowledged: () =>
    set((state: any) => ({
      alerts: state.alerts.filter((a: any) => !a.acknowledged),
    })),
}));
