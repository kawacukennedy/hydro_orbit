import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Farm, Sensor, Alert, IrrigationSchedule, IrrigationEvent,
  SensorType, SensorStatus, AlertSeverity, IrrigationTrigger, IrrigationStatus
} from '@hydro-orbit/shared-types';

// Mock DB
const delay = (ms = 500) => new Promise(resolve => setTimeout(() => resolve(undefined), ms));
const generateId = () => Math.random().toString(36).substring(2, 9);

class MockDb {
  farms: Farm[] = [
    {
      id: 'farm-1',
      name: 'Green Valley Farm',
      location: 'Kigali, Rwanda',
      area: 2.5,
      userId: 'user-1',
      createdAt: new Date(),
      zones: [
        { id: 'zone-1', name: 'Zone A (Tomatoes)', farmId: 'farm-1', cropType: 'Tomatoes', moistureThreshold: 30, sensors: [] },
        { id: 'zone-2', name: 'Zone B (Maize)', farmId: 'farm-1', cropType: 'Maize', moistureThreshold: 20, sensors: [] }
      ],
      sensors: []
    }
  ];

  sensors: Sensor[] = [
    { id: 's1', type: SensorType.MOISTURE, zoneId: 'zone-1', farmId: 'farm-1', lastReading: 32, battery: 98, status: SensorStatus.ONLINE },
    { id: 's2', type: SensorType.PH, zoneId: 'zone-1', farmId: 'farm-1', lastReading: 6.8, battery: 95, status: SensorStatus.ONLINE },
    { id: 's3', type: SensorType.WATER_LEVEL, farmId: 'farm-1', lastReading: 1200, battery: 100, status: SensorStatus.ONLINE },
    { id: 's4', type: SensorType.MOISTURE, zoneId: 'zone-2', farmId: 'farm-1', lastReading: 20, battery: 45, status: SensorStatus.LOW_BATTERY },
  ];

  alerts: Alert[] = [
    { id: 'a1', severity: AlertSeverity.CRITICAL, message: 'pH level critically low in Zone B (5.2)', acknowledged: false, farmId: 'farm-1', createdAt: new Date(Date.now() - 3600000) },
    { id: 'a2', severity: AlertSeverity.WARNING, message: 'Water tank below 20%', acknowledged: true, farmId: 'farm-1', createdAt: new Date(Date.now() - 7200000) },
  ] as Alert[];

  schedules: IrrigationSchedule[] = [
    { id: 'sch-1', zoneId: 'zone-1', days: ['Mon', 'Wed', 'Fri'], time: '06:00', duration: 15, enabled: true },
    { id: 'sch-2', zoneId: 'zone-2', days: ['Tue', 'Thu', 'Sat'], time: '18:00', duration: 20, enabled: true }
  ];

  history: IrrigationEvent[] = [
    { id: 'ev-1', zoneId: 'zone-1', startTime: new Date(Date.now() - 86400000), duration: 15, volume: 75, trigger: IrrigationTrigger.SCHEDULED, status: IrrigationStatus.COMPLETED },
    { id: 'ev-2', zoneId: 'zone-2', startTime: new Date(Date.now() - 172800000), duration: 20, volume: 100, trigger: IrrigationTrigger.MANUAL, status: IrrigationStatus.COMPLETED }
  ];

  irrigationStatus = {
    status: 'idle',
    mode: 'auto',
    activeZone: null as string | null
  };
}

const db = new MockDb();

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: async () => { await delay(); return db.farms; },
  });
}

export function useFarm(farmId: string) {
  return useQuery({
    queryKey: ['farm', farmId],
    queryFn: async () => { await delay(); return db.farms.find(f => f.id === farmId); },
    enabled: !!farmId,
  });
}

export function useFarmStats(farmId: string) {
  return useQuery({
    queryKey: ['farm-stats', farmId],
    queryFn: async () => { await delay(); return { activeSensors: 12, waterUsageToday: 350 }; },
    enabled: !!farmId,
  });
}

export function useSensors() {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: async () => { await delay(); return db.sensors; },
  });
}

export function useSensorHistory(sensorId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['sensor-history', sensorId, from, to],
    queryFn: async () => {
      await delay();
      return Array.from({ length: 24 }).map((_, i) => ({
        id: `reading-${i}`,
        sensorId,
        value: 20 + Math.random() * 20,
        timestamp: new Date(Date.now() - i * 3600000)
      }));
    },
    enabled: !!sensorId,
  });
}

export function useAlerts(unread?: boolean, severity?: string) {
  return useQuery({
    queryKey: ['alerts', unread, severity],
    queryFn: async () => {
      await delay();
      let res = db.alerts;
      if (unread) res = res.filter(a => !a.acknowledged);
      if (severity) res = res.filter(a => a.severity === severity);
      return res;
    },
  });
}

export function useIrrigationStatus() {
  return useQuery({
    queryKey: ['irrigation-status'],
    queryFn: async () => { await delay(); return db.irrigationStatus; },
  });
}

export function useIrrigationSchedules() {
  return useQuery({
    queryKey: ['irrigation-schedules'],
    queryFn: async () => { await delay(); return db.schedules; },
  });
}

export function useIrrigationHistory(farmId?: string, limit = 20) {
  return useQuery({
    queryKey: ['irrigation-history', farmId, limit],
    queryFn: async () => { await delay(); return db.history.slice(0, limit); },
  });
}

export function useCreateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; location: string; area: number }) => {
      await delay();
      const newFarm = { id: generateId(), ...data, userId: 'user-1', createdAt: new Date(), zones: [], sensors: [] };
      db.farms.push(newFarm);
      return newFarm;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useUpdateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ farmId, data }: { farmId: string; data: Partial<Farm> }) => {
      await delay();
      const idx = db.farms.findIndex(f => f.id === farmId);
      if (idx > -1) db.farms[idx] = { ...db.farms[idx], ...data };
      return db.farms[idx];
    },
    onSuccess: (_, { farmId }) => {
      queryClient.invalidateQueries({ queryKey: ['farm', farmId] });
      queryClient.invalidateQueries({ queryKey: ['farms'] });
    },
  });
}

export function useDeleteFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (farmId: string) => {
      await delay();
      db.farms = db.farms.filter(f => f.id !== farmId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ farmId, data }: { farmId: string; data: any }) => {
      await delay();
      const farm = db.farms.find(f => f.id === farmId);
      if (farm) farm.zones.push({ id: generateId(), farmId, ...data, sensors: [] });
    },
    onSuccess: (_, { farmId }) => queryClient.invalidateQueries({ queryKey: ['farm', farmId] }),
  });
}

export function useStartManualIrrigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { zoneId: string; duration: number }) => {
      await delay();
      db.irrigationStatus = { status: 'active', mode: 'manual', activeZone: data.zoneId };
      db.history.unshift({
        id: generateId(),
        zoneId: data.zoneId,
        startTime: new Date(),
        duration: data.duration,
        volume: data.duration * 5,
        trigger: IrrigationTrigger.MANUAL,
        status: IrrigationStatus.ACTIVE
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation-status'] });
      queryClient.invalidateQueries({ queryKey: ['irrigation-history'] });
    },
  });
}

export function useStopIrrigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await delay();
      db.irrigationStatus.status = 'idle';
      db.irrigationStatus.activeZone = null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['irrigation-status'] }),
  });
}

export function useSetIrrigationMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mode: 'auto' | 'manual' | 'schedule' }) => {
      await delay();
      db.irrigationStatus.mode = data.mode;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['irrigation-status'] }),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await delay();
      db.schedules.push({ id: generateId(), ...data });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['irrigation-schedules'] }),
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: string) => {
      await delay();
      db.schedules = db.schedules.filter(s => s.id !== scheduleId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['irrigation-schedules'] }),
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      await delay();
      const a = db.alerts.find(a => a.id === alertId);
      if (a) a.acknowledged = true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useAcknowledgeAllAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await delay();
      db.alerts.forEach(a => a.acknowledged = true);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useSensorReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sensorId: string; value: number }) => {
      await delay();
      const s = db.sensors.find(s => s.id === data.sensorId);
      if (s) s.lastReading = data.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensors'] }),
  });
}

