import { Router } from 'express';
import { prisma, io } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { irrigationScheduleSchema, manualIrrigationSchema, irrigationModeSchema } from '@hydro-orbit/shared-validators';

const router = Router();

router.use(auth);

router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    res.json({ status: 'idle', mode: 'auto' });
  } catch (error) {
    next(error);
  }
});

router.post('/manual', async (req: AuthRequest, res, next) => {
  try {
    const { zoneId, duration } = manualIrrigationSchema.parse(req.body);

    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) {
      throw new AppError('Zone not found', 404);
    }

    const event = await prisma.irrigationEvent.create({
      data: {
        zoneId,
        duration,
        trigger: 'MANUAL',
        status: 'ACTIVE',
      },
    });

    const farm = await prisma.farm.findFirst({
      where: { zones: { some: { id: zoneId } } },
    });

    if (farm) {
      io.to(`farm-${farm.id}`).emit('irrigation:status', {
        eventId: event.id,
        status: 'active',
        zoneId,
      });
    }

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.post('/stop', async (req: AuthRequest, res, next) => {
  try {
    const activeEvent = await prisma.irrigationEvent.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (activeEvent) {
      await prisma.irrigationEvent.update({
        where: { id: activeEvent.id },
        data: { status: 'COMPLETED', endTime: new Date() },
      });
    }

    res.json({ status: 'stopped' });
  } catch (error) {
    next(error);
  }
});

router.get('/schedules', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f) => f.id);

    const schedules = await prisma.irrigationSchedule.findMany({
      where: { zone: { farmId: { in: farmIds } } },
      include: { zone: true },
    });

    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

router.post('/schedules', async (req: AuthRequest, res, next) => {
  try {
    const data = irrigationScheduleSchema.parse(req.body);

    const schedule = await prisma.irrigationSchedule.create({ data });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.delete('/schedules/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.irrigationSchedule.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/mode', async (req: AuthRequest, res, next) => {
  try {
    const { mode } = irrigationModeSchema.parse(req.body);
    res.json({ mode });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: AuthRequest, res, next) => {
  try {
    const { farmId, limit = '20' } = req.query;
    
    const where = farmId ? { zone: { farmId: farmId as string } } : {};

    const events = await prisma.irrigationEvent.findMany({
      where,
      include: { zone: true },
      orderBy: { startTime: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
});

export default router;
