import { Router } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';

const router = Router();
const prisma = new PrismaClient();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.use(authenticate as any);

// POST /api/ai/recommend-vendors
router.post('/recommend-vendors', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { rfqId } = req.body;
    
    // Fetch all active vendors to send to Python for scoring
    const vendors = await prisma.vendor.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, category: true, rating: true }
    });

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/recommend-vendors`, {
        rfqId,
        vendors
      }, { timeout: 5000 });
      
      await logActivity(req.user.id, 'rfq', rfqId, 'ai_recommendation_requested', {});
      return res.json(response.data);
    } catch (pythonErr) {
      console.warn('[AI Service] /recommend-vendors failed, using fallback:', pythonErr);
      
      // Fallback: simple rating sort
      const fallback = vendors
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map(v => ({
          vendorId: v.id,
          name: v.name,
          score: v.rating * 10,
          reason: 'Top Rated (Fallback)'
        }));
        
      return res.json({ recommendations: fallback });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/rank-quotations
router.post('/rank-quotations', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { rfqId } = req.body;
    
    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      include: { vendor: { select: { name: true, rating: true } } }
    });

    if (quotations.length === 0) {
      return res.json({ rankings: [] });
    }

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/rank-quotations`, {
        rfqId,
        quotations: quotations.map(q => ({
          id: q.id,
          vendorName: q.vendor.name,
          vendorRating: q.vendor.rating,
          totalPrice: q.totalPrice,
          deliveryDays: q.deliveryDays
        }))
      }, { timeout: 5000 });
      
      await logActivity(req.user.id, 'rfq', rfqId, 'ai_ranking_requested', {});
      return res.json(response.data);
    } catch (pythonErr) {
      console.warn('[AI Service] /rank-quotations failed, using fallback:', pythonErr);
      
      // Fallback: lowest price first
      const fallback = quotations
        .sort((a, b) => a.totalPrice - b.totalPrice)
        .map((q, idx) => {
          let badge = '';
          if (idx === 0) badge = 'Best Overall ⭐';
          return {
            quotationId: q.id,
            score: 100 - (idx * 10),
            badge
          };
        });
        
      return res.json({ rankings: fallback });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/spend-forecast
router.post('/spend-forecast', requireRole(['admin', 'manager']) as any, async (req: AuthRequest, res) => {
  try {
    // Get historical spend data
    const pos = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true, issuedAt: true }
    });

    const monthlyData: Record<string, number> = {};
    pos.forEach(po => {
      const monthStr = `${po.issuedAt.getFullYear()}-${String(po.issuedAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + po.totalAmount;
    });

    const history = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, spend]) => ({ month, spend }));

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/spend-forecast`, {
        history
      }, { timeout: 5000 });
      
      return res.json(response.data);
    } catch (pythonErr) {
      console.warn('[AI Service] /spend-forecast failed, using fallback:', pythonErr);
      
      // Fallback: just duplicate last month
      const lastMonth = history.length > 0 ? history[history.length - 1].spend : 0;
      return res.json({
        forecast: [
          { month: 'Next Month 1', predictedSpend: lastMonth },
          { month: 'Next Month 2', predictedSpend: lastMonth },
          { month: 'Next Month 3', predictedSpend: lastMonth }
        ]
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
