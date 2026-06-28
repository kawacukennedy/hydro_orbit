import { Router, Request, Response, NextFunction } from 'express';
import { SimulationEngine } from '../simulation.js';

export const router = Router();

function getEngine(req: Request): SimulationEngine {
  return req.simulationEngine as SimulationEngine;
}

const MOCK_USERS = [
  { id: 'user-1', phone: '0788123456', password: 'password123', name: 'Demo Farmer', role: 'FARMER' },
];

router.post('/api/auth/login', (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const user = MOCK_USERS.find(u => u.phone === phone && u.password === password);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }
  res.json({
    token: 'demo-token-hydro-orbit-2024',
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  });
});

router.post('/api/auth/register', (req: Request, res: Response) => {
  const { phone, password, name } = req.body;
  if (MOCK_USERS.find(u => u.phone === phone)) {
    return res.status(400).json({ status: 'error', message: 'Phone number already registered' });
  }
  const newUser = { id: `user-${Date.now()}`, phone, password, name, role: 'FARMER' };
  res.status(201).json({
    token: 'demo-token-hydro-orbit-2024',
    user: { id: newUser.id, phone: newUser.phone, name: newUser.name, role: newUser.role },
  });
});

router.post('/api/auth/refresh', (req: Request, res: Response) => {
  res.json({ token: 'demo-token-hydro-orbit-2024' });
});

router.get('/api/sensors/current', (req: Request, res: Response) => {
  const engine = getEngine(req);
  res.json({
    readings: engine.getCurrentReadings(),
    timestamp: engine.getCurrentTime().toISOString(),
  });
});

router.get('/api/sensors/history', (req: Request, res: Response) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const engine = getEngine(req);
  res.json({
    history: engine.getHistory(hours),
    total: engine.getHistory(hours).length,
    period: `${hours}h`,
  });
});

router.get('/api/tank', (req: Request, res: Response) => {
  const engine = getEngine(req);
  res.json(engine.getTankStatus());
});

router.get('/api/solar', (req: Request, res: Response) => {
  const engine = getEngine(req);
  res.json(engine.getSolarStatus());
});

router.get('/api/irrigation/status', (req: Request, res: Response) => {
  const engine = getEngine(req);
  res.json(engine.getIrrigationStatus());
});

router.post('/api/irrigation/start', (req: Request, res: Response) => {
  const { zoneId, duration } = req.body;
  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }
  const engine = getEngine(req);
  engine.startZoneIrrigation(zoneId, duration || 5);
  res.json({ status: 'started', zoneId, duration: duration || 5 });
});

router.post('/api/irrigation/stop', (req: Request, res: Response) => {
  const { zoneId } = req.body;
  const engine = getEngine(req);
  if (zoneId) {
    engine.stopZoneIrrigation(zoneId);
    res.json({ status: 'stopped', zoneId });
  } else {
    const status = engine.getIrrigationStatus();
    for (const z of status.zones) {
      if (z.isActive) engine.stopZoneIrrigation(z.zoneId);
    }
    res.json({ status: 'stopped', zoneId: 'all' });
  }
});

router.post('/api/irrigation/mode', (req: Request, res: Response) => {
  const { zoneId, auto } = req.body;
  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }
  const engine = getEngine(req);
  engine.setZoneMode(zoneId, auto);
  res.json({ zoneId, mode: auto ? 'auto' : 'manual' });
});

router.get('/api/alerts', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const unread = req.query.unread === 'true';
  const severity = req.query.severity as string | undefined;
  res.json({
    alerts: engine.getAlerts(unread, severity),
    unreadCount: engine.getAlerts(true).length,
  });
});

router.post('/api/alerts/:alertId/acknowledge', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const ok = engine.acknowledgeAlert(req.params.alertId);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

router.post('/api/alerts/acknowledge-all', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const count = engine.acknowledgeAllAlerts();
  res.json({ success: true, acknowledged: count });
});

router.get('/api/system/status', (req: Request, res: Response) => {
  const engine = getEngine(req);
  res.json(engine.getSystemStatus());
});

router.get('/api/farms', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const readings = engine.getCurrentReadings();
  const tank = engine.getTankStatus();
  const solar = engine.getSolarStatus();
  const irrigation = engine.getIrrigationStatus();
  res.json([{
    id: 'farm-1',
    name: 'Gatsibo Demo Farm',
    location: 'Eastern Province, Rwanda',
    area: 2.5,
    areaUnit: 'hectares',
    cropType: 'Mixed (Maize, Beans, Vegetables)',
    waterSource: 'Rainwater Harvesting',
    zones: readings.map(r => ({
      id: r.zoneId,
      name: r.zoneName,
      crop: r.zoneName.split(' - ')[1] || 'Mixed',
      area: 0.8,
      sensors: 2,
    })),
    stats: {
      totalZones: readings.length,
      totalSensors: readings.length,
      onlineSensors: readings.length,
      tankLevel: tank.percent,
      batteryLevel: solar.batteryLevel,
      activeIrrigations: irrigation.zones.filter(z => z.isActive).length,
    },
  }]);
});

router.get('/api/farms/:farmId/stats', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const readings = engine.getCurrentReadings();
  res.json({
    totalArea: 2.5,
    zoneCount: readings.length,
    sensorCount: readings.length,
    onlineSensors: readings.length,
    offlineSensors: 0,
  });
});

router.post('/api/farms/:farmId/sensors/reading', (req: Request, res: Response) => {
  res.status(201).json({ id: `reading-${Date.now()}`, ...req.body, timestamp: new Date().toISOString() });
});

router.get('/api/history/irrigation', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const irrigation = engine.getIrrigationStatus();
  res.json(irrigation.zones.map(z => ({
    id: `event-${z.zoneId}`,
    zoneId: z.zoneId,
    zoneName: z.zoneId.replace('zone-', 'Zone ').toUpperCase(),
    duration: z.duration,
    trigger: z.isAutoMode ? 'AUTO' : 'MANUAL',
    status: z.isActive ? 'ACTIVE' : 'COMPLETED',
    startTime: z.lastIrrigation,
    endTime: z.isActive ? null : new Date(z.lastIrrigation.getTime() + z.duration * 60 * 1000),
  })));
});

router.get('/api/history/sensor', (req: Request, res: Response) => {
  const engine = getEngine(req);
  const readings = engine.getCurrentReadings();
  const history = engine.getHistory(24);
  res.json(readings.map(r => ({
    id: r.zoneId,
    name: r.zoneName,
    readings: history.slice(-24).map(h => ({
      id: `point-${h.timestamp.getTime()}`,
      value: r.zoneId === 'zone-a' ? h.moisture : r.zoneId === 'zone-b' ? h.moisture * 0.9 : h.moisture * 1.1,
      timestamp: h.timestamp,
    })),
  })));
});

router.post('/api/irrigation/schedules', (req: Request, res: Response) => {
  res.status(201).json({ id: `schedule-${Date.now()}`, ...req.body });
});
