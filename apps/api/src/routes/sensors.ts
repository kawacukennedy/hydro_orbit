import { Router } from 'express';
import { prisma, io } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { sensorReadingSchema } from '@hydro-orbit/shared-validators';

const router = Router();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f: { id: string }) => f.id);

    const sensors = await prisma.sensor.findMany({
      where: { farmId: { in: farmIds } },
      include: { zone: true },
    });

    res.json(sensors);
  } catch (error) {
    next(error);
  }
});

router.get('/:sensorId', async (req: AuthRequest, res, next) => {
  try {
    const sensor = await prisma.sensor.findUnique({
      where: { id: req.params.sensorId },
      include: { zone: true, readings: { take: 1, orderBy: { timestamp: 'desc' } } },
    });

    if (!sensor) {
      throw new AppError('Sensor not found', 404);
    }

    res.json(sensor);
  } catch (error) {
    next(error);
  }
});

router.get('/:sensorId/history', async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const readings = await prisma.sensorReading.findMany({
      where: {
        sensorId: req.params.sensorId,
        timestamp: { gte: fromDate, lte: toDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    res.json(readings);
  } catch (error) {
    next(error);
  }
});

router.post('/reading', async (req, res, next) => {
  try {
    const { sensorId, value } = sensorReadingSchema.parse(req.body);

    const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) {
      throw new AppError('Sensor not found', 404);
    }

    const reading = await prisma.sensorReading.create({
      data: { sensorId, value, timestamp: new Date() },
    });

    await prisma.sensor.update({
      where: { id: sensorId },
      data: { lastReading: value },
    });

    const farm = await prisma.farm.findFirst({
      where: { sensors: { some: { id: sensorId } } },
    });

    if (farm) {
      io.to(`farm-${farm.id}`).emit('sensor:update', {
        sensorId,
        value,
        timestamp: reading.timestamp,
      });
    }

    res.status(201).json(reading);
  } catch (error) {
    next(error);
  }
});

router.post('/readings/batch', async (req, res, next) => {
  try {
    const { readings } = req.body;
    
    if (!Array.isArray(readings) || readings.length === 0) {
      throw new AppError('Readings array is required', 400);
    }

    const createdReadings = await Promise.all(
      readings.map(async (reading: { sensorId: string; value: number }) => {
        const { sensorId, value } = sensorReadingSchema.parse(reading);
        
        const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
        if (!sensor) return null;

        const created = await prisma.sensorReading.create({
          data: { sensorId, value, timestamp: new Date() },
        });

        await prisma.sensor.update({
          where: { id: sensorId },
          data: { lastReading: value },
        });

        return created;
      })
    );

    const validReadings = createdReadings.filter(Boolean);
    res.status(201).json(validReadings);
  } catch (error) {
    next(error);
  }
});

export default router;
