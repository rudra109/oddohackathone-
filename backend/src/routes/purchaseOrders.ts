import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/purchase-orders
router.get('/', requireRole(['manager', 'procurement_officer', 'admin']) as any, async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        invoices: true
      },
      orderBy: { issuedAt: 'desc' }
    });
    res.json(pos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/purchase-orders/:id
router.get('/:id', requireRole(['manager', 'procurement_officer', 'admin']) as any, async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: true,
        quotation: {
          include: { rfq: { include: { items: true } } }
        },
        invoices: true
      }
    });
    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });
    res.json(po);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/purchase-orders/:id/status
router.patch('/:id/status', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // "acknowledged" | "delivered" | "cancelled"
    
    const po = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status }
    });

    await logActivity(req.user.id, 'po', po.id, 'status_updated', { status });
    res.json(po);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
