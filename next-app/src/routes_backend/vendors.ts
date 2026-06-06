import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let where: any = {};
    if (status) where.status = String(status);
    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { gstNumber: { contains: q, mode: 'insensitive' } }
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(vendors);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendors/:id
router.get('/:id', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        rfqs: true,
        purchaseOrders: {
          orderBy: { issuedAt: 'desc' },
          take: 5
        }
      }
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors
router.post('/', requireRole(['admin', 'procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const vendor = await prisma.vendor.create({
      data: req.body
    });
    
    await logActivity(req.user.id, 'vendor', vendor.id, 'created', { name: vendor.name });
    
    res.status(201).json(vendor);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/vendors/:id
router.patch('/:id', requireRole(['admin', 'procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    await logActivity(req.user.id, 'vendor', vendor.id, 'updated', { updates: Object.keys(req.body) });
    
    res.json(vendor);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
