import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { SimulationEngine } from './simulation.js';
import { router as demoRouter } from './routes/demo.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const DEMO_MODE = process.env.DEMO_MODE !== 'false';

export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'Africa/Kigali';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

export let prisma: any = null;
export async function initPrisma() {
  if (!prisma) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch {
      logger.warn('PrismaClient unavailable (prisma generate may be needed)');
    }
  }
  return prisma;
}

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

if (!DEMO_MODE) {
  redis.connect().catch(() => logger.warn('Redis connection failed (non-fatal)'));
}

const simulationEngine = DEMO_MODE ? new SimulationEngine() : null;
if (simulationEngine) {
  simulationEngine.start(3000);
  logger.info('Simulation engine started (demo mode)');
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.timezone = req.headers['x-timezone'] as string || DEFAULT_TIMEZONE;
  req.simulationEngine = simulationEngine;
  next();
});

if (DEMO_MODE && simulationEngine) {
  app.use(demoRouter);
  logger.info('Demo API routes active (including /api/auth, /api/sensors, /api/irrigation, etc.)');
} else {
  Promise.all([
    import('./routes/auth.js'),
    import('./routes/farms.js'),
    import('./routes/sensors.js'),
    import('./routes/irrigation.js'),
    import('./routes/alerts.js'),
    import('./routes/history.js'),
  ]).then(([auth, farms, sensors, irrigation, alerts, history]) => {
    app.use('/api/auth', (auth as any).default);
    app.use('/api/farms', (farms as any).default);
    app.use('/api/sensors', (sensors as any).default);
    app.use('/api/irrigation', (irrigation as any).default);
    app.use('/api/alerts', (alerts as any).default);
    app.use('/api/history', (history as any).default);
    logger.info('Production API routes active');
  }).catch(err => logger.error('Failed to load production routes:', err));
}

const WEB_DIST = path.resolve(__dirname, '../../web/dist');

app.use(express.static(WEB_DIST));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: DEMO_MODE ? 'demo' : 'production',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    timezone: DEFAULT_TIMEZONE,
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path.startsWith('/socket.io/')) return next();
  res.sendFile(path.join(WEB_DIST, 'index.html'));
});

app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('join-farm', (farmId: string) => {
    socket.join(`farm-${farmId}`);
    logger.info(`Client ${socket.id} joined farm ${farmId}`);
  });
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

export { io, simulationEngine };

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (${DEMO_MODE ? 'demo' : 'production'} mode)`);
});
