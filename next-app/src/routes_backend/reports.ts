import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/reports/dashboard-summary
router.get('/dashboard-summary', async (req, res) => {
  try {
    const pendingApprovals = await prisma.approval.count({ where: { status: 'pending' } });
    const activeRfqs = await prisma.rfq.count({ where: { status: 'open' } });
    
    // Total spend this month (from Purchase Orders)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const posThisMonth = await prisma.purchaseOrder.findMany({
      where: { issuedAt: { gte: startOfMonth }, status: { not: 'cancelled' } }
    });
    
    const monthlySpend = posThisMonth.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalVendors = await prisma.vendor.count({ where: { status: 'active' } });

    res.json({
      pendingApprovals,
      activeRfqs,
      monthlySpend,
      totalVendors
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/monthly-spend
router.get('/monthly-spend', async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true, issuedAt: true }
    });

    const monthlyData: Record<string, number> = {};
    
    pos.forEach(po => {
      const month = po.issuedAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + po.totalAmount;
    });

    const result = Object.entries(monthlyData).map(([month, spend]) => ({ month, spend }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/vendor-performance
router.get('/vendor-performance', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: { select: { purchaseOrders: true, quotations: true } },
        purchaseOrders: { select: { totalAmount: true } }
      }
    });

    const result = vendors.map(v => ({
      vendorId: v.id,
      name: v.name,
      rating: v.rating,
      totalOrders: v._count.purchaseOrders,
      totalQuotations: v._count.quotations,
      totalSpend: v.purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0)
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/category-spend
router.get('/category-spend', async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'cancelled' } },
      include: { vendor: { select: { category: true } } }
    });

    const categoryData: Record<string, number> = {};
    
    pos.forEach(po => {
      const cat = po.vendor.category || 'Uncategorized';
      categoryData[cat] = (categoryData[cat] || 0) + po.totalAmount;
    });

    const result = Object.entries(categoryData).map(([category, spend]) => ({ name: category, value: spend }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
