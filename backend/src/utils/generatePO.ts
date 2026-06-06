import { PrismaClient } from '@prisma/client';
import { logActivity } from './logActivity';

const prisma = new PrismaClient();

export async function createPO(quotationId: string, requestedById: string): Promise<any> {
  // 1. Fetch the quotation with vendor info
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { vendor: true, rfq: true }
  });

  if (!quotation) throw new Error(`Quotation ${quotationId} not found`);

  // 2. Compute PO financials
  const subtotal = quotation.totalPrice;
  const taxPercent = 18.0;
  const taxAmount = subtotal * (taxPercent / 100);
  const totalAmount = subtotal + taxAmount;

  // 3. Generate PO number: PO-2026-00001 format
  const year = new Date().getFullYear();
  const count = await prisma.purchaseOrder.count();
  const poNumber = `PO-${year}-${String(count + 1).padStart(5, '0')}`;

  // 4. Find the approval for this quotation
  const approval = await prisma.approval.findFirst({
    where: { quotationId, status: 'approved' }
  });
  if (!approval) throw new Error('No approved approval found for this quotation');

  // 5. Create PO
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      quotationId,
      vendorId: quotation.vendorId,
      approvalId: approval.id,
      subtotal,
      taxPercent,
      taxAmount,
      totalAmount,
      status: 'issued'
    },
    include: { vendor: true, quotation: { include: { rfq: true } } }
  });

  // 6. Mark quotation as accepted
  await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: 'accepted' }
  });

  // 7. Close the RFQ
  await prisma.rfq.update({
    where: { id: quotation.rfqId },
    data: { status: 'closed' }
  });

  // Log activity
  await logActivity(requestedById, 'po', po.id, 'created', {
    poNumber,
    totalAmount,
    vendorId: quotation.vendorId
  });

  return po;
}
