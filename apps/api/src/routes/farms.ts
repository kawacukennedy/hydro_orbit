import { Router } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { farmSchema, zoneSchema } from '@hydro-orbit/shared-validators';

const router = Router();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      include: { zones: true, sensors: true },
    });
    res.json(farms);
  } catch (error) {
    next(error);
  }
});

router.get('/:farmId', async (req: AuthRequest, res, next) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: { id: req.params.farmId, userId: req.user!.userId },
      include: {
        zones: { include: { sensors: true } },
        sensors: true,
      },
    });

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    res.json(farm);
  } catch (error) {
    next(error);
  }
});

router.put('/:farmId', async (req: AuthRequest, res, next) => {
  try {
    const data = farmSchema.parse(req.body);

    const farm = await prisma.farm.findFirst({
      where: { id: req.params.farmId, userId: req.user!.userId },
    });

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    const updated = await prisma.farm.update({
      where: { id: req.params.farmId },
      data,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:farmId', async (req: AuthRequest, res, next) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: { id: req.params.farmId, userId: req.user!.userId },
    });

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    await prisma.farm.delete({ where: { id: req.params.farmId } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = farmSchema.parse(req.body);

    const farm = await prisma.farm.create({
      data: {
        ...data,
        userId: req.user!.userId,
      },
    });

    res.status(201).json(farm);
  } catch (error) {
    next(error);
  }
});

router.post('/:farmId/zones', async (req: AuthRequest, res, next) => {
  try {
    const data = zoneSchema.parse(req.body);

    const farm = await prisma.farm.findFirst({
      where: { id: req.params.farmId, userId: req.user!.userId },
    });

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    const zone = await prisma.zone.create({
      data: {
        ...data,
        farmId: req.params.farmId,
      },
    });

    res.status(201).json(zone);
  } catch (error) {
    next(error);
  }
});

export default router;
