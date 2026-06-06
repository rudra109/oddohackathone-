import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logActivity } from '../utils/logActivity';
import { generateInvoicePDF } from '../utils/generatePDF';
import { sendInvoiceEmail } from '../utils/sendEmail';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate as any);

// GET /api/invoices
router.get('/', requireRole(['manager', 'procurement_officer', 'admin']) as any, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        purchaseOrder: {
          include: { vendor: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices
router.post('/', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const { poId, dueDate } = req.body;
    
    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) return res.status(404).json({ error: 'PO not found' });

    // Generate Invoice number: INV-2026-00001
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        poId,
        invoiceNumber,
        dueDate: new Date(dueDate)
      }
    });

    await logActivity(req.user.id, 'invoice', invoice.id, 'created', { invoiceNumber });
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', requireRole(['manager', 'procurement_officer', 'admin']) as any, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            quotation: { include: { rfq: { include: { items: true } } } }
          }
        }
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id/pdf
router.get('/:id/pdf', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const pdfPath = await generateInvoicePDF(req.params.id);
    
    // Save URL to DB
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { pdfUrl: pdfPath }
    });

    await logActivity(req.user.id, 'invoice', invoice.id, 'pdf_generated', {});
    
    // In production, we'd stream the file or return the path
    // For local dev, we will send the path which frontend can download
    res.json({ pdfUrl: pdfPath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/send-email
router.post('/:id/send-email', requireRole(['procurement_officer']) as any, async (req: AuthRequest, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Generate PDF if it doesn't exist
    if (!invoice.pdfUrl) {
      const pdfPath = await generateInvoicePDF(invoice.id);
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: pdfPath }
      });
    }

    await sendInvoiceEmail(invoice.id);

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'sent', emailedAt: new Date() }
    });

    await logActivity(req.user.id, 'invoice', invoice.id, 'emailed', {});
    
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
