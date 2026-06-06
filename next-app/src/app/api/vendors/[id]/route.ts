import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        rfqs: true,
        purchaseOrders: {
          orderBy: { issuedAt: 'desc' },
          take: 5
        }
      }
    });
    
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: body
    });
    return NextResponse.json(vendor);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
