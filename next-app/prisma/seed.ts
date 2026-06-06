import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rfqItem.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@vendorbridge.com', role: 'admin', passwordHash }
  });
  
  const officer = await prisma.user.create({
    data: { name: 'Procurement Officer', email: 'officer@vendorbridge.com', role: 'procurement_officer', passwordHash }
  });
  
  const manager = await prisma.user.create({
    data: { name: 'Procurement Manager', email: 'manager@vendorbridge.com', role: 'manager', passwordHash }
  });
  
  const vendorUser = await prisma.user.create({
    data: { name: 'Vendor FurniCo', email: 'vendor@furnico.com', role: 'vendor', passwordHash }
  });

  console.log('Seeding Vendors...');
  const v1 = await prisma.vendor.create({
    data: { name: 'FurniCo', category: 'Furniture', gstNumber: '27ABCDE1234F1Z5', contactName: 'Rajesh Kumar', contactEmail: 'vendor@furnico.com', contactPhone: '9876543210', address: 'Mumbai, India', rating: 4.8 }
  });
  const v2 = await prisma.vendor.create({
    data: { name: 'OfficeWorld', category: 'Furniture', gstNumber: '27XYZDE1234F1Z5', contactName: 'Anita Singh', contactEmail: 'contact@officeworld.com', rating: 4.5 }
  });
  const v3 = await prisma.vendor.create({
    data: { name: 'DeskMart', category: 'Furniture', gstNumber: '27PQRST1234F1Z5', contactName: 'Vijay Patel', contactEmail: 'sales@deskmart.com', rating: 4.2 }
  });
  await prisma.vendor.create({ data: { name: 'TechSupply', category: 'IT Hardware', gstNumber: '27AAABB1234F1Z5', contactName: 'Sunita Sharma', contactEmail: 'info@techsupply.com', rating: 4.9 } });
  await prisma.vendor.create({ data: { name: 'CloudCompute', category: 'IT Hardware', gstNumber: '27CCCBB1234F1Z5', contactName: 'Rahul Dev', contactEmail: 'sales@cloudcompute.com', rating: 4.6 } });
  await prisma.vendor.create({ data: { name: 'CleanSweep', category: 'Maintenance', gstNumber: '27DDEEF1234F1Z5', contactName: 'Ajay Verma', contactEmail: 'admin@cleansweep.com', rating: 4.0 } });
  await prisma.vendor.create({ data: { name: 'PowerBackup Solutions', category: 'Maintenance', gstNumber: '27GGGHH1234F1Z5', contactName: 'Neha Gupta', contactEmail: 'contact@powerbackup.com', rating: 4.3 } });
  await prisma.vendor.create({ data: { name: 'StationeryHub', category: 'Office Supplies', gstNumber: '27IIIOO1234F1Z5', contactName: 'Sanjay Dutt', contactEmail: 'orders@stationeryhub.com', rating: 4.7 } });

  console.log('Seeding RFQs...');
  const rfq1 = await prisma.rfq.create({
    data: {
      title: 'Office Chairs Q3',
      description: 'Need ergonomic chairs and standing desks for new floor.',
      status: 'open',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdById: officer.id,
      items: {
        create: [
          { productName: 'Ergonomic Chair', quantity: 50, unit: 'pcs' },
          { productName: 'Standing Desk', quantity: 20, unit: 'pcs' }
        ]
      },
      vendors: {
        connect: [{ id: v1.id }, { id: v2.id }, { id: v3.id }]
      }
    }
  });

  const rfq2 = await prisma.rfq.create({
    data: {
      title: 'Laptops for Engineering Team',
      description: 'MacBook Pro M3 or equivalent for 10 new engineers.',
      status: 'open',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdById: officer.id,
      items: {
        create: [{ productName: 'Developer Laptop', quantity: 10, unit: 'pcs' }]
      }
    }
  });

  console.log('Seeding Quotations...');
  // FurniCo Quote
  const q1 = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      vendorId: v1.id,
      unitPrice: 8500, // They bid average price per combined item roughly
      totalPrice: (50 * 8500) + (20 * 15000), // Manually calculating for seed
      deliveryDays: 12,
      status: 'submitted',
      notes: 'Best price guarantee'
    }
  });

  // OfficeWorld Quote
  await prisma.quotation.create({
    data: { rfqId: rfq1.id, vendorId: v2.id, unitPrice: 9000, totalPrice: 760000, deliveryDays: 7, status: 'submitted' }
  });

  // DeskMart Quote
  await prisma.quotation.create({
    data: { rfqId: rfq1.id, vendorId: v3.id, unitPrice: 8200, totalPrice: 710000, deliveryDays: 20, status: 'submitted' }
  });

  console.log('Seeding Activity Logs...');
  await prisma.activityLog.create({ data: { userId: officer.id, entityType: 'rfq', entityId: rfq1.id, action: 'created', metadata: { title: rfq1.title } } });
  await prisma.activityLog.create({ data: { userId: vendorUser.id, entityType: 'quotation', entityId: q1.id, action: 'submitted', metadata: { rfqId: rfq1.id } } });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
