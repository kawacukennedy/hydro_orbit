import { create } from 'zustand';
import type { Farm } from '@hydro-orbit/shared-types';

interface FarmsState {
  currentFarm: Farm | null;
  farmsList: Farm[];
  isLoading: boolean;
  error: string | null;
  setCurrentFarm: (farm: Farm | null) => void;
  setFarmsList: (farms: Farm[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createFarm: (data: { name: string; location: string; area: number }) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useFarmsStore = create<FarmsState>((set, get) => ({
  currentFarm: null,
  farmsList: [],
  isLoading: false,
  error: null,
  setCurrentFarm: (farm) => set({ currentFarm: farm }),
  setFarmsList: (farms) => set({ farmsList: farms }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  createFarm: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newFarm: Farm = {
        id: generateId(),
        name: data.name,
        location: data.location,
        area: data.area,
        userId: 'current-user',
        zones: [],
        sensors: [],
        createdAt: new Date(),
      };
      const farms = [...get().farmsList, newFarm];
      set({ farmsList: farms, currentFarm: newFarm, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to create farm', isLoading: false });
      throw error;
    }
  },
}));
