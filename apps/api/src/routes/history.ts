import { Router } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/irrigation', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f: { id: string }) => f.id);

    const events = await prisma.irrigationEvent.findMany({
      where: { zone: { farmId: { in: farmIds } } },
      include: { zone: true },
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.get('/sensor', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f: { id: string }) => f.id);

    const sensors = await prisma.sensor.findMany({
      where: { farmId: { in: farmIds } },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    });

    res.json(sensors);
  } catch (error) {
    next(error);
  }
});

export default router;
