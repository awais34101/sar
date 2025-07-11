export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: {
    warehouse?: boolean;
    store?: boolean;
    viewPrices?: boolean;
    viewSales?: boolean;
    manageCustomers?: boolean;
    createInvoices?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Customer {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: string;
  cost?: string;
  warehouseStock: number;
  storeStock: number;
  minStockLevel: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  total: string;
  product?: Product;
}

export interface Technician {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  phone: string;
  specialization?: string;
  status: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: number;
  transferNumber: string;
  productId: number;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: string;
  requestedBy: number;
  approvedBy?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  requester?: User;
  approver?: User;
}

export interface StaffVisa {
  id: number;
  employeeId: string;
  name: string;
  passportNumber: string;
  visaType: string;
  visaNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  sponsor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  pendingInvoices: number;
  totalProducts: number;
  lowStockCount: number;
}
