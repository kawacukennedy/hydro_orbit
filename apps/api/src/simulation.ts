interface SensorState {
  zoneId: string;
  zoneName: string;
  moisture: number;
  pH: number;
  temperature: number;
  humidity: number;
}

interface TankState {
  level: number;
  capacity: number;
  flowRate: number;
}

interface SolarState {
  power: number;
  batteryLevel: number;
  isCharging: boolean;
}

interface ZoneIrrigationState {
  zoneId: string;
  isActive: boolean;
  isAutoMode: boolean;
  duration: number;
  elapsed: number;
  lastIrrigation: Date;
}

interface AlertState {
  id: string;
  type: 'moisture_low' | 'moisture_high' | 'ph_out_of_range' | 'tank_low' | 'tank_critical' | 'battery_low' | 'system_offline';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  zoneId?: string;
  acknowledged: boolean;
  createdAt: Date;
}

interface HistoryPoint {
  timestamp: Date;
  moisture: number;
  pH: number;
  temperature: number;
  tankLevel: number;
  solarPower: number;
}

const ZONES = [
  { id: 'zone-a', name: 'Zone A - Maize', crop: 'Maize', baseMoisture: 55, optimalPH: 6.5 },
  { id: 'zone-b', name: 'Zone B - Beans', crop: 'Beans', baseMoisture: 50, optimalPH: 6.2 },
  { id: 'zone-c', name: 'Zone C - Vegetables', crop: 'Vegetables', baseMoisture: 65, optimalPH: 6.8 },
];

const MOISTURE_DECAY_PER_HOUR = 2.5;
const PH_DRIFT_PER_HOUR = 0.05;
const IRRIGATION_MOISTURE_BOOST = 20;
const TANK_DECAY_PER_HOUR_IRRIGATING = 8;
const TANK_DECAY_PER_HOUR_IDLE = 0.5;
const RAIN_TANK_BOOST = 15;
const RAIN_MOISTURE_BOOST = 12;
const BATTERY_DRAIN_PER_HOUR = 3;
const BATTERY_CHARGE_PER_HOUR = 15;
const SOLAR_PEAK_WATTS = 120;
const TANK_CAPACITY = 5000;
const TANK_START_LEVEL = 3800;
const BATTERY_CAPACITY = 100;
const ALERT_CHECK_INTERVAL_MS = 60000;

let alertIdCounter = 0;

export class SimulationEngine {
  private sensors: SensorState[];
  private tank: TankState;
  private solar: SolarState;
  private zones: ZoneIrrigationState[];
  private alerts: AlertState[];
  private history: HistoryPoint[];
  private rainTimer: number;
  private isRaining: boolean;
  private lastTick: Date;
  private alertTimer: ReturnType<typeof setInterval> | null;
  private historyTimer: ReturnType<typeof setInterval> | null;
  private tickTimer: ReturnType<typeof setInterval> | null;
  private currentTime: Date;

  constructor() {
    this.currentTime = new Date();
    this.sensors = ZONES.map(z => ({
      zoneId: z.id,
      zoneName: z.name,
      moisture: z.baseMoisture + (Math.random() * 8 - 4),
      pH: z.optimalPH + (Math.random() * 0.4 - 0.2),
      temperature: 26 + (Math.random() * 6 - 3),
      humidity: 55 + (Math.random() * 10 - 5),
    }));
    this.tank = { level: TANK_START_LEVEL, capacity: TANK_CAPACITY, flowRate: 2.5 };
    this.solar = { power: 0, batteryLevel: 80, isCharging: false };
    this.zones = ZONES.map(z => ({
      zoneId: z.id,
      isActive: false,
      isAutoMode: true,
      duration: 0,
      elapsed: 0,
      lastIrrigation: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }));
    this.alerts = [];
    this.history = [];
    this.rainTimer = 0;
    this.isRaining = false;
    this.lastTick = new Date();
    this.alertTimer = null;
    this.historyTimer = null;
    this.tickTimer = null;
    this.generateInitialHistory();
  }

  private generateInitialHistory(): void {
    const points = 288;
    const now = Date.now();
    for (let i = points - 1; i >= 0; i--) {
      const t = new Date(now - i * 5 * 60 * 1000);
      const hoursSinceMidnight = t.getHours() + t.getMinutes() / 60;
      const solarFactor = this.computeSolarFactor(hoursSinceMidnight);
      const noise = (Math.random() - 0.5);
      const moistureTrend = 50 + 10 * Math.sin(i * 0.05) + noise * 3;
      this.history.push({
        timestamp: t,
        moisture: Math.max(15, Math.min(95, moistureTrend)),
        pH: 6.2 + Math.sin(i * 0.01) * 0.3 + noise * 0.1,
        temperature: 25 + 8 * Math.sin((i / 288) * Math.PI) + noise * 2,
        tankLevel: TANK_START_LEVEL - (i / 288) * 500 + noise * 50,
        solarPower: SOLAR_PEAK_WATTS * solarFactor,
      });
    }
  }

  private computeSolarFactor(hoursSinceMidnight: number): number {
    if (hoursSinceMidnight < 6 || hoursSinceMidnight >= 18) return 0;
    const daylightHours = hoursSinceMidnight - 6;
    return Math.sin((daylightHours / 12) * Math.PI);
  }

  start(intervalMs: number = 3000): void {
    this.tick();
    this.tickTimer = setInterval(() => this.tick(), intervalMs);
    this.historyTimer = setInterval(() => this.recordHistoryPoint(), 5 * 60 * 1000);
    this.alertTimer = setInterval(() => this.checkAlerts(), ALERT_CHECK_INTERVAL_MS);
  }

  stop(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.historyTimer) clearInterval(this.historyTimer);
    if (this.alertTimer) clearInterval(this.alertTimer);
  }

  private tick(): void {
    const now = new Date();
    this.currentTime = now;
    const hoursSinceLastTick = (now.getTime() - this.lastTick.getTime()) / (1000 * 60 * 60);
    this.lastTick = now;

    const hoursSinceMidnight = now.getHours() + now.getMinutes() / 60;
    const solarFactor = this.computeSolarFactor(hoursSinceMidnight);
    const cloudCover = 0.2 + Math.random() * 0.3;
    this.solar.power = Math.round(SOLAR_PEAK_WATTS * solarFactor * (1 - cloudCover));

    if (solarFactor > 0.3) {
      this.solar.batteryLevel = Math.min(BATTERY_CAPACITY,
        this.solar.batteryLevel + BATTERY_CHARGE_PER_HOUR * hoursSinceLastTick * solarFactor);
      this.solar.isCharging = true;
    } else {
      this.solar.batteryLevel = Math.max(10,
        this.solar.batteryLevel - BATTERY_DRAIN_PER_HOUR * hoursSinceLastTick);
      this.solar.isCharging = false;
    }

    if (this.rainTimer > 0) {
      this.rainTimer -= hoursSinceLastTick * 60;
      this.isRaining = true;
    } else {
      this.isRaining = false;
      if (Math.random() < 0.01) {
        this.rainTimer = 5 + Math.random() * 10;
      }
    }

    let totalIrrigating = 0;
    for (const zone of this.zones) {
      if (zone.isActive) {
        zone.elapsed += hoursSinceLastTick * 60;
        totalIrrigating++;
        if (zone.elapsed >= zone.duration) {
          zone.isActive = false;
          zone.elapsed = 0;
        }
      } else if (zone.isAutoMode) {
        const sensor = this.sensors.find(s => s.zoneId === zone.zoneId)!;
        const lastIrrigationHours = (now.getTime() - zone.lastIrrigation.getTime()) / (1000 * 60 * 60);
        if (sensor.moisture < 35 && lastIrrigationHours > 2) {
          this.startZoneIrrigation(zone.zoneId, 5);
        }
      }
    }

    for (const sensor of this.sensors) {
      const zone = ZONES.find(z => z.id === sensor.zoneId)!;
      const decay = MOISTURE_DECAY_PER_HOUR * hoursSinceLastTick;
      sensor.moisture = Math.max(10, sensor.moisture - decay);

      if (this.isRaining) {
        sensor.moisture = Math.min(95, sensor.moisture + RAIN_MOISTURE_BOOST * hoursSinceLastTick);
      }

      const irrigating = this.zones.find(z => z.zoneId === sensor.zoneId)?.isActive;
      if (irrigating) {
        sensor.moisture = Math.min(90, sensor.moisture + IRRIGATION_MOISTURE_BOOST * hoursSinceLastTick);
      }

      const drift = (Math.random() - 0.5) * 2 * PH_DRIFT_PER_HOUR * hoursSinceLastTick;
      sensor.pH = Math.max(4.5, Math.min(8.5, sensor.pH + drift));

      sensor.temperature += (Math.random() - 0.5) * 2 * hoursSinceLastTick;
      sensor.temperature = Math.max(15, Math.min(45, sensor.temperature));
    }

    const tankDecay = totalIrrigating > 0
      ? TANK_DECAY_PER_HOUR_IRRIGATING * hoursSinceLastTick
      : TANK_DECAY_PER_HOUR_IDLE * hoursSinceLastTick;
    this.tank.level = Math.max(0, this.tank.level - tankDecay * 10);

    if (this.isRaining) {
      this.tank.level = Math.min(this.tank.capacity, this.tank.level + RAIN_TANK_BOOST * hoursSinceLastTick * 50);
    }
  }

  startZoneIrrigation(zoneId: string, durationMinutes: number): void {
    const zone = this.zones.find(z => z.zoneId === zoneId);
    if (!zone) return;
    zone.isActive = true;
    zone.duration = durationMinutes;
    zone.elapsed = 0;
    zone.lastIrrigation = new Date();
  }

  stopZoneIrrigation(zoneId: string): void {
    const zone = this.zones.find(z => z.zoneId === zoneId);
    if (!zone) return;
    zone.isActive = false;
    zone.elapsed = 0;
  }

  setZoneMode(zoneId: string, isAuto: boolean): void {
    const zone = this.zones.find(z => z.zoneId === zoneId);
    if (zone) zone.isAutoMode = isAuto;
  }

  private recordHistoryPoint(): void {
    const now = new Date();
    const avgMoisture = this.sensors.reduce((s, z) => s + z.moisture, 0) / this.sensors.length;
    const avgPH = this.sensors.reduce((s, z) => s + z.pH, 0) / this.sensors.length;
    const avgTemp = this.sensors.reduce((s, z) => s + z.temperature, 0) / this.sensors.length;
    this.history.push({
      timestamp: now,
      moisture: Math.round(avgMoisture * 10) / 10,
      pH: Math.round(avgPH * 100) / 100,
      temperature: Math.round(avgTemp * 10) / 10,
      tankLevel: Math.round(this.tank.level),
      solarPower: Math.round(this.solar.power),
    });
    if (this.history.length > 1000) {
      this.history = this.history.slice(-500);
    }
  }

  private checkAlerts(): void {
    for (const sensor of this.sensors) {
      if (sensor.moisture < 20 && !this.hasActiveAlert(`moisture_low_${sensor.zoneId}`)) {
        this.addAlert({
          type: 'moisture_low',
          severity: 'critical',
          message: `Critical: ${sensor.zoneName} moisture at ${Math.round(sensor.moisture)}%`,
          zoneId: sensor.zoneId,
        });
      } else if (sensor.moisture < 30 && !this.hasActiveAlert(`moisture_low_${sensor.zoneId}`)) {
        this.addAlert({
          type: 'moisture_low',
          severity: 'warning',
          message: `Low moisture in ${sensor.zoneName}: ${Math.round(sensor.moisture)}%`,
          zoneId: sensor.zoneId,
        });
      }
      if (sensor.pH < 5.5 || sensor.pH > 7.5) {
        if (!this.hasActiveAlert(`ph_${sensor.zoneId}`)) {
          this.addAlert({
            type: 'ph_out_of_range',
            severity: 'warning',
            message: `${sensor.zoneName} pH at ${sensor.pH.toFixed(1)} — outside optimal range`,
            zoneId: sensor.zoneId,
          });
        }
      }
    }

    const tankPercent = (this.tank.level / this.tank.capacity) * 100;
    if (tankPercent < 10 && !this.hasActiveAlert('tank_critical')) {
      this.addAlert({
        type: 'tank_critical',
        severity: 'critical',
        message: `Tank critically low: ${Math.round(this.tank.level)}L (${Math.round(tankPercent)}%)`,
      });
    } else if (tankPercent < 20 && !this.hasActiveAlert('tank_low')) {
      this.addAlert({
        type: 'tank_low',
        severity: 'warning',
        message: `Tank level low: ${Math.round(this.tank.level)}L (${Math.round(tankPercent)}%)`,
      });
    }

    if (this.solar.batteryLevel < 15 && !this.hasActiveAlert('battery_low')) {
      this.addAlert({
        type: 'battery_low',
        severity: 'warning',
        message: `Battery at ${Math.round(this.solar.batteryLevel)}% — recharge soon`,
      });
    }
  }

  private hasActiveAlert(key: string): boolean {
    return this.alerts.some(a => !a.acknowledged && (a.type + '_' + (a.zoneId || '')) === key);
  }

  private addAlert(data: Omit<AlertState, 'id' | 'acknowledged' | 'createdAt'>): void {
    this.alerts.unshift({
      ...data,
      id: `alert-${++alertIdCounter}`,
      acknowledged: false,
      createdAt: new Date(),
    });
  }

  getCurrentReadings() {
    return this.sensors.map(s => ({
      zoneId: s.zoneId,
      zoneName: s.zoneName,
      moisture: Math.round(s.moisture * 10) / 10,
      pH: Math.round(s.pH * 100) / 100,
      temperature: Math.round(s.temperature * 10) / 10,
      humidity: Math.round(s.humidity * 10) / 10,
      status: s.moisture < 20 ? 'critical' : s.moisture < 35 ? 'low' : s.moisture > 80 ? 'high' : 'normal',
    }));
  }

  getTankStatus() {
    return {
      level: Math.round(this.tank.level),
      capacity: this.tank.capacity,
      percent: Math.round((this.tank.level / this.tank.capacity) * 100),
      flowRate: this.tank.flowRate,
    };
  }

  getSolarStatus() {
    return {
      power: Math.round(this.solar.power),
      batteryLevel: Math.round(this.solar.batteryLevel * 10) / 10,
      isCharging: this.solar.isCharging,
      peakWatts: SOLAR_PEAK_WATTS,
    };
  }

  getIrrigationStatus() {
    return {
      zones: this.zones.map(z => ({
        zoneId: z.zoneId,
        isActive: z.isActive,
        isAutoMode: z.isAutoMode,
        duration: z.duration,
        elapsed: Math.round(z.elapsed * 10) / 10,
        remainingMinutes: Math.max(0, Math.round((z.duration - z.elapsed) * 10) / 10),
        lastIrrigation: z.lastIrrigation,
      })),
      isRaining: this.isRaining,
    };
  }

  getAlerts(unread?: boolean, severity?: string): AlertState[] {
    let filtered = [...this.alerts];
    if (unread) filtered = filtered.filter(a => !a.acknowledged);
    if (severity) filtered = filtered.filter(a => a.severity === severity);
    return filtered;
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  acknowledgeAllAlerts(): number {
    let count = 0;
    for (const alert of this.alerts) {
      if (!alert.acknowledged) {
        alert.acknowledged = true;
        count++;
      }
    }
    return count;
  }

  getHistory(hours: number = 24): HistoryPoint[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.history.filter(h => h.timestamp.getTime() >= cutoff);
  }

  getSystemStatus() {
    const avgMoisture = this.sensors.reduce((s, z) => s + z.moisture, 0) / this.sensors.length;
    return {
      status: avgMoisture < 25 ? 'alert' : avgMoisture < 40 ? 'attention' : 'healthy',
      activeIrrigations: this.zones.filter(z => z.isActive).length,
      totalZones: this.zones.length,
      onlineSensors: this.sensors.length,
      totalSensors: this.sensors.length,
      uptime: process.uptime(),
      timezone: 'Africa/Kigali',
      timestamp: new Date().toISOString(),
    };
  }

  getCurrentTime(): Date {
    return this.currentTime;
  }
}
