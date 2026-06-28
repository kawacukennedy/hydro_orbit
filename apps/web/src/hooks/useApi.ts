import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ZONES = [
  { id: 'zone-a', name: 'Zone A - Maize', crop: 'Maize', baseMoisture: 55, optimalPH: 6.5 },
  { id: 'zone-b', name: 'Zone B - Beans', crop: 'Beans', baseMoisture: 50, optimalPH: 6.2 },
  { id: 'zone-c', name: 'Zone C - Vegetables', crop: 'Vegetables', baseMoisture: 65, optimalPH: 6.8 },
];

const SOLAR_PEAK_WATTS = 120;
const TANK_CAPACITY = 5000;

class SensorSimulator {
  private sensors: Array<{
    zoneId: string; zoneName: string; moisture: number; pH: number; temperature: number; humidity: number;
  }>;
  private tankLevel: number;
  private solarPower: number;
  private batteryLevel: number;
  private zoneActive: Record<string, boolean>;
  private zoneAuto: Record<string, boolean>;
  private zoneLastIrrigation: Record<string, number>;
  private isRaining: boolean;
  private rainTimer: number;
  private alertIdCounter: number;
  private alerts: AlertItem[];
  private history: HistoryPoint[];
  private historyCounter: number;

  constructor() {
    this.sensors = ZONES.map(z => ({
      zoneId: z.id, zoneName: z.name,
      moisture: z.baseMoisture + (Math.random() * 8 - 4),
      pH: z.optimalPH + (Math.random() * 0.4 - 0.2),
      temperature: 26 + (Math.random() * 6 - 3),
      humidity: 55 + (Math.random() * 10 - 5),
    }));
    this.tankLevel = 3800;
    this.solarPower = 0;
    this.batteryLevel = 80;
    this.zoneActive = {};
    this.zoneAuto = { 'zone-a': true, 'zone-b': true, 'zone-c': true };
    this.zoneLastIrrigation = { 'zone-a': Date.now() - 6 * 3600000, 'zone-b': Date.now() - 8 * 3600000, 'zone-c': Date.now() - 4 * 3600000 };
    this.isRaining = false;
    this.rainTimer = 0;
    this.alertIdCounter = 0;
    this.alerts = [];
    this.history = [];
    this.historyCounter = 0;
    this.generateInitialHistory();
  }

  private generateInitialHistory() {
    const now = Date.now();
    for (let i = 288; i >= 0; i--) {
      const t = now - i * 300000;
      const h = (new Date(t).getHours() + new Date(t).getMinutes() / 60);
      const sf = h < 6 || h >= 18 ? 0 : Math.sin(((h - 6) / 12) * Math.PI);
      const noise = (Math.random() - 0.5);
      this.history.push({
        timestamp: t, moisture: Math.round((50 + 10 * Math.sin(i * 0.05) + noise * 3) * 10) / 10,
        pH: Math.round((6.2 + Math.sin(i * 0.01) * 0.3 + noise * 0.1) * 100) / 100,
        temperature: Math.round((25 + 8 * Math.sin((i / 288) * Math.PI) + noise * 2) * 10) / 10,
        tankLevel: Math.round(TANK_CAPACITY - (i / 288) * 500 + noise * 50),
        solarPower: Math.round(SOLAR_PEAK_WATTS * sf),
      });
    }
  }

  tickNow() {
    const now = Date.now();
    const h = (new Date(now).getHours() + new Date(now).getMinutes() / 60);
    const sf = h < 6 || h >= 18 ? 0 : Math.sin(((h - 6) / 12) * Math.PI);
    const cloud = 0.2 + Math.random() * 0.3;
    this.solarPower = Math.round(SOLAR_PEAK_WATTS * sf * (1 - cloud));

    if (sf > 0.3) {
      this.batteryLevel = Math.min(100, this.batteryLevel + 15 * (1 / 1200));
    } else {
      this.batteryLevel = Math.max(10, this.batteryLevel - 3 * (1 / 1200));
    }

    if (this.rainTimer > 0) {
      this.rainTimer -= 1;
      this.isRaining = true;
    } else {
      this.isRaining = false;
      if (Math.random() < 0.003) this.rainTimer = 60 + Math.random() * 120;
    }

    let totalIrrigating = 0;
    for (const sensor of this.sensors) {
      const decay = 2.5 / 1200;
      sensor.moisture = Math.max(10, sensor.moisture - decay);
      if (this.isRaining) sensor.moisture = Math.min(95, sensor.moisture + 12 / 1200);
      if (this.zoneActive[sensor.zoneId]) {
        sensor.moisture = Math.min(90, sensor.moisture + 20 / 1200);
        totalIrrigating++;
      }
      const drift = (Math.random() - 0.5) * 2 * 0.05 / 1200;
      sensor.pH = Math.max(4.5, Math.min(8.5, sensor.pH + drift));
      if (this.zoneAuto[sensor.zoneId] && !this.zoneActive[sensor.zoneId]) {
        const lastHr = (now - (this.zoneLastIrrigation[sensor.zoneId] || now)) / 3600000;
        if (sensor.moisture < 35 && lastHr > 2) {
          this.zoneActive[sensor.zoneId] = true;
          this.zoneLastIrrigation[sensor.zoneId] = now;
        }
      }
    }

    const tankDecay = totalIrrigating > 0 ? 80 / 1200 : 5 / 1200;
    this.tankLevel = Math.max(0, this.tankLevel - tankDecay);
    if (this.isRaining) this.tankLevel = Math.min(TANK_CAPACITY, this.tankLevel + 750 / 1200);

    this.historyCounter++;
    if (this.historyCounter % 100 === 0) {
      const avgM = this.sensors.reduce((s, z) => s + z.moisture, 0) / this.sensors.length;
      const avgP = this.sensors.reduce((s, z) => s + z.pH, 0) / this.sensors.length;
      const avgT = this.sensors.reduce((s, z) => s + z.temperature, 0) / this.sensors.length;
      this.history.push({
        timestamp: now, moisture: Math.round(avgM * 10) / 10, pH: Math.round(avgP * 100) / 100,
        temperature: Math.round(avgT * 10) / 10, tankLevel: Math.round(this.tankLevel),
        solarPower: Math.round(this.solarPower),
      });
      if (this.history.length > 1000) this.history = this.history.slice(-500);
    }

    for (const s of this.sensors) {
      if (s.moisture < 20 && !this.alerts.find(a => !a.acknowledged && a.type === `moisture_low_${s.zoneId}`)) {
        this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'moisture_low', severity: 'critical', message: `Critical: ${s.zoneName} moisture at ${Math.round(s.moisture)}%`, zoneId: s.zoneId, acknowledged: false, createdAt: now });
      } else if (s.moisture < 30 && !this.alerts.find(a => !a.acknowledged && a.type === `moisture_low_${s.zoneId}`)) {
        this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'moisture_low', severity: 'warning', message: `Low moisture in ${s.zoneName}: ${Math.round(s.moisture)}%`, zoneId: s.zoneId, acknowledged: false, createdAt: now });
      }
      if ((s.pH < 5.5 || s.pH > 7.5) && !this.alerts.find(a => !a.acknowledged && a.type === `ph_${s.zoneId}`)) {
        this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'ph_out_of_range', severity: 'warning', message: `${s.zoneName} pH at ${s.pH.toFixed(1)} - outside optimal range`, zoneId: s.zoneId, acknowledged: false, createdAt: now });
      }
    }
    const tp = (this.tankLevel / TANK_CAPACITY) * 100;
    if (tp < 10 && !this.alerts.find(a => !a.acknowledged && a.type === 'tank_critical')) {
      this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'tank_critical', severity: 'critical', message: `Tank critically low: ${Math.round(this.tankLevel)}L (${Math.round(tp)}%)`, acknowledged: false, createdAt: now });
    } else if (tp < 20 && !this.alerts.find(a => !a.acknowledged && a.type === 'tank_low')) {
      this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'tank_low', severity: 'warning', message: `Tank level low: ${Math.round(this.tankLevel)}L (${Math.round(tp)}%)`, acknowledged: false, createdAt: now });
    }
    if (this.batteryLevel < 15 && !this.alerts.find(a => !a.acknowledged && a.type === 'battery_low')) {
      this.alerts.unshift({ id: `alert-${++this.alertIdCounter}`, type: 'battery_low', severity: 'warning', message: `Battery at ${Math.round(this.batteryLevel)}% - recharge soon`, acknowledged: false, createdAt: now });
    }
  }

  getReadings() {
    return this.sensors.map(s => ({
      zoneId: s.zoneId, zoneName: s.zoneName, moisture: Math.round(s.moisture * 10) / 10,
      pH: Math.round(s.pH * 100) / 100, temperature: Math.round(s.temperature * 10) / 10,
      humidity: Math.round(s.humidity * 10) / 10,
      status: s.moisture < 20 ? 'critical' : s.moisture < 35 ? 'low' : s.moisture > 80 ? 'high' : 'normal',
    }));
  }
  getTank() { return { level: Math.round(this.tankLevel), capacity: TANK_CAPACITY, percent: Math.round((this.tankLevel / TANK_CAPACITY) * 100) }; }
  getSolar() { return { power: this.solarPower, batteryLevel: Math.round(this.batteryLevel * 10) / 10, isCharging: this.solarPower > 10, peakWatts: SOLAR_PEAK_WATTS }; }
  getIrrigation() {
    return {
      zones: ZONES.map(z => ({
        zoneId: z.id, isActive: !!this.zoneActive[z.id], isAutoMode: this.zoneAuto[z.id] ?? true, lastIrrigation: new Date(this.zoneLastIrrigation[z.id] || Date.now()),
      })),
      isRaining: this.isRaining,
    };
  }
  startZoneIrrigation(zoneId: string) { this.zoneActive[zoneId] = true; this.zoneLastIrrigation[zoneId] = Date.now(); }
  stopZoneIrrigation(zoneId: string) { this.zoneActive[zoneId] = false; }
  setZoneMode(zoneId: string, auto: boolean) { this.zoneAuto[zoneId] = auto; }
  getAlerts(unread?: boolean, severity?: string) {
    let f = [...this.alerts];
    if (unread) f = f.filter(a => !a.acknowledged);
    if (severity) f = f.filter(a => a.severity === severity);
    return f;
  }
  acknowledgeAlert(id: string) { const a = this.alerts.find(x => x.id === id); if (a) a.acknowledged = true; }
  acknowledgeAll() { this.alerts.forEach(a => a.acknowledged = true); }
  getHistory(hours = 24) { const cutoff = Date.now() - hours * 3600000; return this.history.filter(h => h.timestamp >= cutoff); }
}

interface HistoryPoint { timestamp: number; moisture: number; pH: number; temperature: number; tankLevel: number; solarPower: number; }
interface AlertItem { id: string; type: string; severity: string; message: string; zoneId?: string; acknowledged: boolean; createdAt: number; }

const sim = new SensorSimulator();
const REFRESH_MS = 3000;

setInterval(() => sim.tickNow(), 1000);

export function useSensorReadings() {
  return useQuery({
    queryKey: ['sensor-readings'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      return { readings: sim.getReadings(), timestamp: new Date().toISOString() };
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useTankStatus() {
  return useQuery({
    queryKey: ['tank-status'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 50)); return sim.getTank(); },
    refetchInterval: REFRESH_MS,
  });
}

export function useSolarStatus() {
  return useQuery({
    queryKey: ['solar-status'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 50)); return sim.getSolar(); },
    refetchInterval: REFRESH_MS,
  });
}

export function useIrrigationStatus() {
  return useQuery({
    queryKey: ['irrigation-status'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 50)); return sim.getIrrigation(); },
    refetchInterval: REFRESH_MS,
  });
}

export function useAlerts(unread?: boolean, severity?: string) {
  return useQuery({
    queryKey: ['alerts', unread, severity],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      return { alerts: sim.getAlerts(unread, severity), unreadCount: sim.getAlerts(true).length };
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useSensorHistory(hours: number = 24) {
  return useQuery({
    queryKey: ['sensor-history', hours],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      return sim.getHistory(hours);
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      const readings = sim.getReadings();
      const tank = sim.getTank();
      const solar = sim.getSolar();
      const irrigation = sim.getIrrigation();
      return [{
        id: 'farm-1', name: 'Gatsibo Demo Farm', location: 'Eastern Province, Rwanda',
        area: 2.5, areaUnit: 'hectares', cropType: 'Mixed (Maize, Beans, Vegetables)',
        waterSource: 'Rainwater Harvesting',
        zones: readings.map(r => ({ id: r.zoneId, name: r.zoneName, crop: r.zoneName.split(' - ')[1] || 'Mixed', area: 0.8, sensors: 2 })),
        stats: { totalZones: readings.length, totalSensors: readings.length, onlineSensors: readings.length, tankLevel: tank.percent, batteryLevel: solar.batteryLevel, activeIrrigations: irrigation.zones.filter(z => z.isActive).length },
      }];
    },
  });
}

export function useFarm(farmId: string) {
  return useQuery({
    queryKey: ['farm', farmId],
    queryFn: async () => { await new Promise(r => setTimeout(r, 50)); return (await useFarms().refetch()).data?.[0]; },
    enabled: !!farmId,
  });
}

export function useFarmStats(farmId: string) {
  return useQuery({
    queryKey: ['farm-stats', farmId],
    queryFn: async () => { await new Promise(r => setTimeout(r, 50)); return { activeSensors: 12, waterUsageToday: 350 }; },
    enabled: !!farmId,
  });
}

export function useStartManualIrrigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { zoneId: string }) => { sim.startZoneIrrigation(data.zoneId); await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['irrigation-status'] }); qc.invalidateQueries({ queryKey: ['sensor-readings'] }); },
  });
}

export function useStopIrrigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zoneId?: string) => {
      if (zoneId) sim.stopZoneIrrigation(zoneId);
      else sim.getIrrigation().zones.filter(z => z.isActive).forEach(z => sim.stopZoneIrrigation(z.zoneId));
      await new Promise(r => setTimeout(r, 100));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['irrigation-status'] }); qc.invalidateQueries({ queryKey: ['sensor-readings'] }); },
  });
}

export function useSetIrrigationMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { zoneId: string; auto: boolean }) => { sim.setZoneMode(data.zoneId, data.auto); await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['irrigation-status'] }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => { sim.acknowledgeAlert(alertId); await new Promise(r => setTimeout(r, 50)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useAcknowledgeAllAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { sim.acknowledgeAll(); await new Promise(r => setTimeout(r, 50)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useSensorReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await new Promise(r => setTimeout(r, 50)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sensor-readings'] }),
  });
}

export function useIrrigationHistory() {
  return useQuery({
    queryKey: ['irrigation-history'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      const irr = sim.getIrrigation();
      return irr.zones.map(z => ({
        zoneId: z.zoneId, zoneName: z.zoneId.replace('zone-', 'Zone ').toUpperCase(),
        startTime: z.lastIrrigation, duration: 5, trigger: z.isAutoMode ? 'AUTO' : 'MANUAL',
        status: z.isActive ? 'ACTIVE' : 'COMPLETED',
      }));
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { await new Promise(r => setTimeout(r, 100)); return { id: crypto.randomUUID(), ...data }; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useUpdateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_data: { farmId: string; data: any }) => { await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['farms'] }); qc.invalidateQueries({ queryKey: ['farm'] }); },
  });
}

export function useDeleteFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_farmId: string) => { await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_data: { farmId: string; data: any }) => { await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farm'] }),
  });
}

export function useIrrigationSchedules() {
  return useQuery({
    queryKey: ['irrigation-schedules'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 50));
      return [
        { id: 'sch-1', zoneId: 'zone-a', days: ['Mon', 'Wed', 'Fri'], time: '06:00', duration: 15, enabled: true },
        { id: 'sch-2', zoneId: 'zone-b', days: ['Tue', 'Thu', 'Sat'], time: '18:00', duration: 20, enabled: true },
        { id: 'sch-3', zoneId: 'zone-c', days: ['Mon', 'Wed', 'Fri'], time: '07:00', duration: 10, enabled: false },
      ];
    },
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { await new Promise(r => setTimeout(r, 100)); return { id: crypto.randomUUID(), ...data }; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['irrigation-schedules'] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_scheduleId: string) => { await new Promise(r => setTimeout(r, 100)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['irrigation-schedules'] }),
  });
}
