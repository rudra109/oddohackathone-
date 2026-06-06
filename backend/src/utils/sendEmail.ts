import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '2525');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({ host, port, auth: { user, pass } });
  }

  // Console mock transporter when no SMTP configured
  return {
    sendMail: async (opts: any) => {
      console.log('\n========== MOCK EMAIL ==========');
      console.log(`To:      ${opts.to}`);
      console.log(`Subject: ${opts.subject}`);
      if (opts.attachments?.length) {
        opts.attachments.forEach((a: any) => console.log(`  Attachment: ${a.filename}`));
      }
      console.log('================================\n');
      return { messageId: `mock-${Date.now()}` };
    }
  } as any;
}

export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      purchaseOrder: {
        include: { vendor: true }
      }
    }
  });

  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const vendor = invoice.purchaseOrder.vendor;
  const pdfAbsPath = invoice.pdfUrl
    ? path.join(__dirname, '../../', invoice.pdfUrl)
    : null;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"VendorBridge" <noreply@vendorbridge.com>',
    to: vendor.contactEmail,
    subject: `Invoice ${invoice.invoiceNumber} from VendorBridge`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0284c7;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">VendorBridge</h1>
          <p style="color:#bae6fd;margin:4px 0 0">Procurement & Vendor Management ERP</p>
        </div>
        <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p>Dear <strong>${vendor.contactName}</strong>,</p>
          <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for your reference.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f8fafc">
              <td style="padding:8px;border:1px solid #e2e8f0">Invoice Number</td>
              <td style="padding:8px;border:1px solid #e2e8f0"><strong>${invoice.invoiceNumber}</strong></td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e2e8f0">Issued Date</td>
              <td style="padding:8px;border:1px solid #e2e8f0">${new Date(invoice.issuedDate).toLocaleDateString('en-IN')}</td>
            </tr>
            <tr style="background:#f8fafc">
              <td style="padding:8px;border:1px solid #e2e8f0">Due Date</td>
              <td style="padding:8px;border:1px solid #e2e8f0">${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e2e8f0">PO Reference</td>
              <td style="padding:8px;border:1px solid #e2e8f0">${invoice.purchaseOrder.poNumber}</td>
            </tr>
          </table>
          <p>The PDF invoice is attached to this email for your records.</p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">
            This is an automated message from VendorBridge. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    attachments: pdfAbsPath && fs.existsSync(pdfAbsPath)
      ? [{ filename: `${invoice.invoiceNumber}.pdf`, path: pdfAbsPath }]
      : []
  });
}
