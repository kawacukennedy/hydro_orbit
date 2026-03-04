import { create } from 'zustand';
import type { Alert } from '@hydro-orbit/shared-types';

type AlertFilter = 'all' | 'unread' | 'critical' | 'warning' | 'info';

interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  filter: AlertFilter;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setFilter: (filter: AlertFilter) => void;
  clearAlerts: () => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,
  filter: 'all',
  setAlerts: (alerts) => set({ 
    alerts, 
    unreadCount: alerts.filter((a) => !a.acknowledged).length 
  }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
      unreadCount: state.alerts.filter(
        (a) => !a.acknowledged && a.id !== alertId
      ).length,
    })),
  setFilter: (filter) => set({ filter }),
  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));
