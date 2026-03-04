import { create } from 'zustand';
import type { Sensor, SensorReading } from '@hydro-orbit/shared-types';

interface SensorsState {
  sensors: Sensor[];
  readings: Record<string, SensorReading[]>;
  isLoading: boolean;
  error: string | null;
  setSensors: (sensors: Sensor[]) => void;
  addReading: (sensorId: string, reading: SensorReading) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSensorsStore = create<SensorsState>((set) => ({
  sensors: [],
  readings: {},
  isLoading: false,
  error: null,
  setSensors: (sensors) => set({ sensors, isLoading: false }),
  addReading: (sensorId, reading) =>
    set((state) => ({
      readings: {
        ...state.readings,
        [sensorId]: [...(state.readings[sensorId] || []), reading].slice(-100),
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
