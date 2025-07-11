import { Schema, model, Document } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  role: string;
  permissions: {
    canManageUsers?: boolean;
    canManageCustomers?: boolean;
    canManageProducts?: boolean;
    canManageInvoices?: boolean;
    canManageTechnicians?: boolean;
    canManageTransfers?: boolean;
    canManageStaffVisas?: boolean;
    canViewReports?: boolean;
    canManageSettings?: boolean;
    canViewPrices?: boolean;
    canViewCosts?: boolean;
    canViewFinancials?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  permissions: {
    type: Object,
    default: {}
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

export const User = model<IUser>('User', userSchema);

// Customer interface and schema
export interface ICustomer extends Document {
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  status: { type: String, required: true, default: 'active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Customer = model<ICustomer>('Customer', customerSchema);

// Product interface and schema
export interface IProduct extends Document {
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  averageCost?: number;
  lastSaleDate?: Date;
  totalSold: number;
  warehouseStock: number;
  storeStock: number;
  minStockLevel: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number },
  averageCost: { type: Number },
  lastSaleDate: { type: Date },
  totalSold: { type: Number, required: true, default: 0 },
  warehouseStock: { type: Number, required: true, default: 0 },
  storeStock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Product = model<IProduct>('Product', productSchema);

// Invoice interface and schema
export interface IInvoice extends Document {
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  notes: { type: String },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);

// Technician interface and schema
export interface ITechnician extends Document {
  employeeId: string;
  name: string;
  email?: string;
  phone: string;
  specialization?: string;
  status: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema = new Schema<ITechnician>({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  specialization: { type: String },
  status: { type: String, required: true, default: 'active' },
  hireDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Technician = model<ITechnician>('Technician', technicianSchema);

// Transfer interface and schema
export interface ITransfer extends Document {
  transferNumber: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: string;
  requestedBy: string;
  approvedBy?: string;
  technicianName?: string;
  activityType?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transferSchema = new Schema<ITransfer>({
  transferNumber: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  technicianName: { type: String },
  activityType: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Transfer = model<ITransfer>('Transfer', transferSchema);

// Staff Visa interface and schema
export interface IStaffVisa extends Document {
  employeeId: string;
  employeeName: string;
  visaType: string;
  visaNumber: string;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  sponsorCompany?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffVisaSchema = new Schema<IStaffVisa>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  visaType: { type: String, required: true },
  visaNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, required: true, default: 'active' },
  sponsorCompany: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const StaffVisa = model<IStaffVisa>('StaffVisa', staffVisaSchema);

// System Setting interface and schema
export interface ISystemSetting extends Document {
  key: string;
  value: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SystemSetting = model<ISystemSetting>('SystemSetting', systemSettingSchema);

// Technician Activity interface and schema
export interface ITechnicianActivity extends Document {
  technicianId?: string;
  technicianName: string;
  activityType: string;
  productId?: string;
  productName?: string;
  quantity: number;
  transferId?: string;
  notes?: string;
  workDate: Date;
  createdAt: Date;
}

const technicianActivitySchema = new Schema<ITechnicianActivity>({
  technicianId: { type: String },
  technicianName: { type: String, required: true },
  activityType: { type: String, required: true },
  productId: { type: String },
  productName: { type: String },
  quantity: { type: Number, required: true },
  transferId: { type: String },
  notes: { type: String },
  workDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const TechnicianActivity = model<ITechnicianActivity>('TechnicianActivity', technicianActivitySchema);

// System Alert interface and schema
export interface ISystemAlert extends Document {
  type: string;
  title: string;
  message: string;
  productId?: string;
  referenceId?: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
}

const systemAlertSchema = new Schema<ISystemAlert>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  productId: { type: String },
  referenceId: { type: String },
  priority: { type: String, required: true, default: 'medium' },
  isRead: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const SystemAlert = model<ISystemAlert>('SystemAlert', systemAlertSchema);