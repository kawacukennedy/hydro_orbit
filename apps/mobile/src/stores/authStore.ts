import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  name: string;
  role: 'FARMER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (phone, password) => {
        set({ isLoading: true, error: null });
        setTimeout(() => {
          if (password === 'password123') {
            const mockUser: User = { id: 'u1', name: 'Farmer John', phone, role: 'FARMER' };
            set({ user: mockUser, token: 'mock-token', isAuthenticated: true, isLoading: false });
          } else {
            set({ error: 'Invalid credentials', isLoading: false });
          }
        }, 1000);
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'hydro-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
