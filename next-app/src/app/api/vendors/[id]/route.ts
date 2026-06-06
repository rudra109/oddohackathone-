import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Vendor, Rfq, PurchaseOrder } from '@/models';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    
    // Mongoose query replicating the Prisma include
    const vendor = await Vendor.findById(params.id).lean();
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    
    const rfqs = await Rfq.find({ vendors: vendor._id }).lean();
    const purchaseOrders = await PurchaseOrder.find({ vendorId: vendor._id })
      .sort({ issuedAt: -1 })
      .limit(5)
      .lean();
      
    return NextResponse.json({ ...vendor, rfqs, purchaseOrders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    const body = await request.json();
    
    const vendor = await Vendor.findByIdAndUpdate(params.id, body, { new: true }).lean();
    return NextResponse.json(vendor);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    await Vendor.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
