import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';
import { createPO } from '../utils/generatePO';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/approvals
router.get('/', requireRole(['manager', 'procurement_officer', 'admin']) as any, async (req, res) => {
  try {
    const approvals = await prisma.approval.findMany({
      include: {
        quotation: {
          include: { vendor: true, rfq: true }
        },
        requestedBy: { select: { name: true, email: true } },
        approver: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(approvals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/approvals
router.post('/', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { quotationId, remarks } = req.body;
    
    const approval = await prisma.approval.create({
      data: {
        quotationId,
        requestedById: req.user.id,
        remarks
      }
    });

    await logActivity(req.user.id, 'approval', approval.id, 'requested', { quotationId });
    res.status(201).json(approval);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/approvals/:id/approve
router.post('/:id/approve', requireRole(['manager']) as any, async (req: AuthRequest, res) => {
  try {
    const { remarks } = req.body;
    
    const approval = await prisma.approval.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        approverId: req.user.id,
        remarks,
        actionedAt: new Date()
      }
    });

    await logActivity(req.user.id, 'approval', approval.id, 'approved', { remarks });

    // Roadmap says: Approve with remarks → triggers PO
    const po = await createPO(approval.quotationId, req.user.id);

    res.json({ approval, po });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/approvals/:id/reject
router.post('/:id/reject', requireRole(['manager']) as any, async (req: AuthRequest, res) => {
  try {
    const { remarks } = req.body;
    
    const approval = await prisma.approval.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        approverId: req.user.id,
        remarks,
        actionedAt: new Date()
      }
    });

    await logActivity(req.user.id, 'approval', approval.id, 'rejected', { remarks });
    res.json(approval);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
