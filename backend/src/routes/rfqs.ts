import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/rfqs
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status: String(status) } : {};
    
    const rfqs = await prisma.rfq.findMany({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { items: true, vendors: true, quotations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rfqs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rfqs
router.post('/', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { title, description, deadline, items, vendorIds } = req.body;
    
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdById: req.user.id,
        items: {
          create: items.map((i: any) => ({
            productName: i.productName,
            quantity: Number(i.quantity),
            unit: i.unit
          }))
        },
        vendors: {
          connect: vendorIds.map((id: string) => ({ id }))
        }
      },
      include: { items: true, vendors: true }
    });

    await logActivity(req.user.id, 'rfq', rfq.id, 'created', { title });
    
    res.status(201).json(rfq);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/rfqs/:id
router.get('/:id', async (req, res) => {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        vendors: true,
        createdBy: { select: { name: true, email: true } },
        quotations: {
          include: { vendor: true }
        }
      }
    });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(rfq);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rfqs/:id/status
router.patch('/:id/status', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // "open" | "closed" | "cancelled"
    const rfq = await prisma.rfq.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    await logActivity(req.user.id, 'rfq', rfq.id, 'status_updated', { status });
    res.json(rfq);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
