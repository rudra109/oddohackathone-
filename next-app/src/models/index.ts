import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// 2. Vendor Schema
export interface IVendor extends Document {
  name: string;
  category: string;
  gstNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: string;
  rating: number;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  gstNumber: { type: String, required: true },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: { type: String },
  status: { type: String, default: 'active' },
  rating: { type: Number, default: 0.0 },
  createdAt: { type: Date, default: Date.now }
});

export const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

// 3. Rfq Schema
export interface IRfqItem {
  productName: string;
  quantity: number;
  unit: string;
}

export interface IRfq extends Document {
  title: string;
  description: string;
  status: string;
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  items: IRfqItem[];
  vendors: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const RfqItemSchema = new Schema<IRfqItem>({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pcs' }
});

const RfqSchema = new Schema<IRfq>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'draft' },
  deadline: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [RfqItemSchema],
  vendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
  createdAt: { type: Date, default: Date.now }
});

export const Rfq: Model<IRfq> = mongoose.models.Rfq || mongoose.model<IRfq>('Rfq', RfqSchema);

// 4. Quotation Schema
export interface IQuotation extends Document {
  rfqId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  notes?: string;
  status: string;
  submittedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>({
  rfqId: { type: Schema.Types.ObjectId, ref: 'Rfq', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, default: 'submitted' },
  submittedAt: { type: Date, default: Date.now }
});

export const Quotation: Model<IQuotation> = mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);

// 5. Approval Schema
export interface IApproval extends Document {
  quotationId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  approver?: mongoose.Types.ObjectId;
  status: string;
  remarks?: string;
  actionedAt?: Date;
  createdAt: Date;
}

const ApprovalSchema = new Schema<IApproval>({
  quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  remarks: { type: String },
  actionedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Approval: Model<IApproval> = mongoose.models.Approval || mongoose.model<IApproval>('Approval', ApprovalSchema);

// 6. Purchase Order Schema
export interface IPurchaseOrder extends Document {
  poNumber: string;
  quotationId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  approvalId: mongoose.Types.ObjectId;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  issuedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  poNumber: { type: String, required: true, unique: true },
  quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  approvalId: { type: Schema.Types.ObjectId, ref: 'Approval', required: true, unique: true },
  subtotal: { type: Number, required: true },
  taxPercent: { type: Number, default: 18.0 },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'issued' },
  issuedAt: { type: Date, default: Date.now }
});

export const PurchaseOrder: Model<IPurchaseOrder> = mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

// 7. Invoice Schema
export interface IInvoice extends Document {
  invoiceNumber: string;
  poId: mongoose.Types.ObjectId;
  issuedDate: Date;
  dueDate: Date;
  status: string;
  pdfUrl?: string;
  emailedAt?: Date;
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  issuedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'draft' },
  pdfUrl: { type: String },
  emailedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// 8. Activity Log Schema
export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: any;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  action: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
