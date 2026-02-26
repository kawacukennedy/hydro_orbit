import { create } from 'zustand';
import type { Farm, Zone, Sensor } from '@hydro-orbit/shared-types';

interface FarmsState {
  currentFarm: Farm | null;
  farmsList: Farm[];
  isLoading: boolean;
  error: string | null;
  setCurrentFarm: (farm: Farm | null) => void;
  setFarmsList: (farms: Farm[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFarmsStore = create<FarmsState>((set) => ({
  currentFarm: null,
  farmsList: [],
  isLoading: false,
  error: null,
  setCurrentFarm: (farm) => set({ currentFarm: farm }),
  setFarmsList: (farms) => set({ farmsList: farms }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
