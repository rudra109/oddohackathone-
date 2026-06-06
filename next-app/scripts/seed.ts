import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User, Vendor, Rfq, Quotation, PurchaseOrder } from '../src/models';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/vendorbridge';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected! Dropping existing data...');

  await User.deleteMany({});
  await Vendor.deleteMany({});
  await Rfq.deleteMany({});
  await Quotation.deleteMany({});
  await PurchaseOrder.deleteMany({});

  console.log('Seeding Users...');
  const adminPassword = await bcrypt.hash('password123', 10);
  const officerPassword = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@vendorbridge.com',
    passwordHash: adminPassword,
    role: 'admin'
  });

  const officer = await User.create({
    name: 'Procurement Officer',
    email: 'officer@vendorbridge.com',
    passwordHash: officerPassword,
    role: 'procurement_officer'
  });

  console.log('Seeding Vendors...');
  const vendor1 = await Vendor.create({
    name: 'TechFlow Systems Inc.',
    category: 'Software',
    gstNumber: '29ABCDE1234F2Z5',
    contactName: 'John Doe',
    contactEmail: 'john@techflow.com',
    contactPhone: '+1-555-0123',
    status: 'active',
    rating: 4.8
  });

  const vendor2 = await Vendor.create({
    name: 'Global Logistics Corp',
    category: 'Logistics',
    gstNumber: '29XYZAB5678C1Z2',
    contactName: 'Jane Smith',
    contactEmail: 'jane@globallogistics.com',
    contactPhone: '+1-555-0987',
    status: 'active',
    rating: 4.5
  });

  console.log('Seeding RFQs...');
  const rfq1 = await Rfq.create({
    title: 'Q3 Enterprise Software Licenses',
    description: 'Procurement of 500 enterprise software licenses for the engineering department.',
    status: 'open',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    createdBy: officer._id,
    items: [
      { productName: 'Enterprise License', quantity: 500, unit: 'licenses' }
    ],
    vendors: [vendor1._id]
  });

  console.log('Seeding Complete!');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  mongoose.disconnect();
});
