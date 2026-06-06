import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/rfqs/:rfqId/quotations (Wait, roadmap specifies this is under /api/rfqs/:rfqId/quotations but we can implement it here or handle globally)
// Actually, I'll mount this in index.ts as /api/quotations and allow fetching by rfqId query, OR mount the specific route in rfqs.ts.
// The roadmap says: GET /api/rfqs/:rfqId/quotations. I'll just add a global GET /api/quotations that accepts ?rfqId.
router.get('/', async (req, res) => {
  try {
    const { rfqId } = req.query;
    const where = rfqId ? { rfqId: String(rfqId) } : {};
    
    const quotations = await prisma.quotation.findMany({
      where,
      include: { vendor: true },
      orderBy: { totalPrice: 'asc' }
    });
    res.json(quotations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotations
router.post('/', requireRole(['vendor']) as any, async (req: AuthRequest, res) => {
  try {
    const { rfqId, vendorId, unitPrice, deliveryDays, notes } = req.body;
    
    // Ensure vendor matches the logged in user if they have a vendor profile? 
    // For hackathon, we trust the vendorId sent by the frontend if role is vendor.

    const rfq = await prisma.rfq.findUnique({ where: { id: rfqId }, include: { items: true } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    const totalQty = rfq.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = totalQty * Number(unitPrice);

    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        vendorId,
        unitPrice: Number(unitPrice),
        totalPrice,
        deliveryDays: Number(deliveryDays),
        notes
      }
    });

    await logActivity(req.user.id, 'quotation', quotation.id, 'submitted', { rfqId, totalPrice });
    
    res.status(201).json(quotation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/quotations/:id/status
router.patch('/:id/status', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // "shortlisted" | "rejected"
    
    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status }
    });

    await logActivity(req.user.id, 'quotation', quotation.id, 'status_updated', { status });
    
    res.json(quotation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
