import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  notifications: {
    sms: boolean;
    push: boolean;
    email: boolean;
    criticalOnly: boolean;
  };
  theme: 'light' | 'dark';
  timezone: string;
  language: string;
  setNotifications: (notifications: SettingsState['notifications']) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setTimezone: (timezone: string) => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        sms: true,
        push: true,
        email: false,
        criticalOnly: false,
      },
      theme: 'light',
      timezone: 'Africa/Kigali',
      language: 'en',
      setNotifications: (notifications) => set({ notifications }),
      setTheme: (theme) => set({ theme }),
      setTimezone: (timezone) => set({ timezone }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'hydro-settings',
    }
  )
);
