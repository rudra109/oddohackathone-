import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  // Fetch all needed data
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      purchaseOrder: {
        include: {
          vendor: true,
          quotation: {
            include: {
              rfq: {
                include: { items: true }
              }
            }
          }
        }
      }
    }
  });

  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const { purchaseOrder: po } = invoice;
  const { vendor, quotation } = po;
  const lineItems = quotation.rfq.items;

  const uploadDir = path.join(__dirname, '../../uploads/invoices');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  const relativePath = `/uploads/invoices/${fileName}`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ── HEADER ──────────────────────────────────────────────────────────
    doc.fontSize(22).fillColor('#0f172a').text('VendorBridge', 50, 50);
    doc.fontSize(10).fillColor('#64748b').text('Procurement & Vendor Management ERP', 50, 76);
    doc.fontSize(20).fillColor('#0284c7').text('INVOICE', 400, 50, { align: 'right' });

    doc.moveDown(0.5);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 100).lineTo(545, 100).stroke();

    // ── INVOICE META ────────────────────────────────────────────────────
    doc.fontSize(9).fillColor('#475569');
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 115);
    doc.text(`Issue Date: ${new Date(invoice.issuedDate).toLocaleDateString('en-IN')}`, 50, 130);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 50, 145);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 160);
    doc.text(`PO Reference: ${po.poNumber}`, 50, 175);

    // ── VENDOR BLOCK ────────────────────────────────────────────────────
    doc.fontSize(10).fillColor('#0f172a').text('FROM (VENDOR):', 350, 115);
    doc.fontSize(9).fillColor('#334155');
    doc.text(vendor.name, 350, 130);
    doc.text(`GST: ${vendor.gstNumber}`, 350, 145);
    doc.text(vendor.contactEmail, 350, 160);
    if (vendor.address) doc.text(vendor.address, 350, 175, { width: 180 });

    doc.moveDown(3);

    // ── BUYER BLOCK ─────────────────────────────────────────────────────
    const buyerY = doc.y + 10;
    doc.fontSize(10).fillColor('#0f172a').text('TO (BUYER):', 50, buyerY);
    doc.fontSize(9).fillColor('#334155');
    doc.text('VendorBridge Procurement Ltd.', 50, buyerY + 15);
    doc.text('procurement@vendorbridge.com', 50, buyerY + 30);
    doc.text('100 Corporate Office, Tech City, India', 50, buyerY + 45);

    // ── LINE ITEMS TABLE ─────────────────────────────────────────────────
    const tableTop = buyerY + 80;
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, tableTop).lineTo(545, tableTop).stroke();

    // Table headers
    doc.fontSize(9).fillColor('#0f172a');
    doc.text('#', 50, tableTop + 8, { width: 20 });
    doc.text('Item / Service', 75, tableTop + 8, { width: 220 });
    doc.text('Qty', 300, tableTop + 8, { width: 50, align: 'center' });
    doc.text('Unit', 350, tableTop + 8, { width: 50, align: 'center' });
    doc.text('Unit Price', 400, tableTop + 8, { width: 80, align: 'right' });
    doc.text('Total', 480, tableTop + 8, { width: 65, align: 'right' });

    doc.strokeColor('#e2e8f0').moveTo(50, tableTop + 24).lineTo(545, tableTop + 24).stroke();

    let rowY = tableTop + 32;
    lineItems.forEach((item, i) => {
      doc.fontSize(9).fillColor('#334155');
      doc.text(String(i + 1), 50, rowY, { width: 20 });
      doc.text(item.productName, 75, rowY, { width: 220 });
      doc.text(String(item.quantity), 300, rowY, { width: 50, align: 'center' });
      doc.text(item.unit, 350, rowY, { width: 50, align: 'center' });
      doc.text(`₹${quotation.unitPrice.toLocaleString('en-IN')}`, 400, rowY, { width: 80, align: 'right' });
      doc.text(`₹${(item.quantity * quotation.unitPrice).toLocaleString('en-IN')}`, 480, rowY, { width: 65, align: 'right' });
      rowY += 20;
    });

    doc.strokeColor('#e2e8f0').moveTo(50, rowY + 5).lineTo(545, rowY + 5).stroke();

    // ── TOTALS ───────────────────────────────────────────────────────────
    const totalX = 380;
    let totalY = rowY + 20;

    doc.fontSize(9).fillColor('#334155');
    doc.text('Subtotal:', totalX, totalY, { width: 100 });
    doc.text(`₹${po.subtotal.toLocaleString('en-IN')}`, totalX + 100, totalY, { width: 65, align: 'right' });

    totalY += 18;
    doc.text(`GST @ ${po.taxPercent}%:`, totalX, totalY, { width: 100 });
    doc.text(`₹${po.taxAmount.toLocaleString('en-IN')}`, totalX + 100, totalY, { width: 65, align: 'right' });

    totalY += 5;
    doc.strokeColor('#cbd5e1').moveTo(totalX, totalY + 5).lineTo(545, totalY + 5).stroke();
    totalY += 15;

    doc.fontSize(11).fillColor('#0f172a');
    doc.text('GRAND TOTAL:', totalX, totalY, { width: 100 });
    doc.text(`₹${po.totalAmount.toLocaleString('en-IN')}`, totalX + 100, totalY, { width: 65, align: 'right' });

    // ── FOOTER ───────────────────────────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.strokeColor('#e2e8f0').moveTo(50, footerY).lineTo(545, footerY).stroke();
    doc.fontSize(8).fillColor('#94a3b8').text(
      'Thank you for your business · VendorBridge · procurement@vendorbridge.com',
      50, footerY + 12, { align: 'center', width: 495 }
    );

    doc.end();
    stream.on('finish', () => resolve(relativePath));
    stream.on('error', reject);
  });
}
