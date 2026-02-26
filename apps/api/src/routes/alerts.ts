import { Router } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { alertAcknowledgeSchema } from '@hydro-orbit/shared-validators';

const router = Router();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { unread, severity } = req.query;

    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f: { id: string }) => f.id);

    const where: Record<string, unknown> = { farmId: { in: farmIds } };

    if (unread === 'true') {
      where.acknowledged = false;
    }
    if (severity) {
      where.severity = severity;
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

router.post('/:alertId/acknowledge', async (req: AuthRequest, res, next) => {
  try {
    const { alertId } = alertAcknowledgeSchema.parse({ alertId: req.params.alertId });

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { acknowledged: true },
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

router.post('/acknowledge-all', async (req: AuthRequest, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const farmIds = farms.map((f: { id: string }) => f.id);

    await prisma.alert.updateMany({
      where: { farmId: { in: farmIds }, acknowledged: false },
      data: { acknowledged: true },
    });

    res.json({ success: true, message: 'All alerts acknowledged' });
  } catch (error) {
    next(error);
  }
});

export default router;
