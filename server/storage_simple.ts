import { db } from "./db";
import { 
  users, customers, products, invoices, invoiceItems, technicians, transfers, staffVisas,
  type User, type Customer, type Product, type Invoice, type InvoiceItem, 
  type Technician, type Transfer, type StaffVisa,
  type InsertUser, type InsertCustomer, type InsertProduct, type InsertInvoice, 
  type InsertInvoiceItem, type InsertTechnician, type InsertTransfer, type InsertStaffVisa
} from "@shared/schema";
import { eq, desc, ilike, lte, and, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Customers
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Products
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;

  // Invoices
  getInvoices(limit?: number, offset?: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;

  // Technicians
  getTechnicians(limit?: number, offset?: number): Promise<Technician[]>;
  getTechnician(id: number): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, technician: Partial<InsertTechnician>): Promise<Technician>;
  deleteTechnician(id: number): Promise<void>;

  // Transfers
  getTransfers(limit?: number, offset?: number): Promise<Transfer[]>;
  getTransfer(id: number): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: number, transfer: Partial<InsertTransfer>): Promise<Transfer>;
  deleteTransfer(id: number): Promise<void>;

  // Staff Visas
  getStaffVisas(limit?: number, offset?: number): Promise<StaffVisa[]>;
  getStaffVisa(id: number): Promise<StaffVisa | undefined>;
  createStaffVisa(visa: InsertStaffVisa): Promise<StaffVisa>;
  updateStaffVisa(id: number, visa: Partial<InsertStaffVisa>): Promise<StaffVisa>;
  deleteStaffVisa(id: number): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: number;
    totalCustomers: number;
    pendingInvoices: number;
    totalProducts: number;
    lowStockCount: number;
  }>;

  // Simplified price update
  updateProductPrice?(productId: number, newCost: number, quantity: number): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Products
  async getProducts(limit = 50, offset = 0): Promise<Product[]> {
    return db.select().from(products).limit(limit).offset(offset).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updateProduct, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.sku, `%${query}%`),
          ilike(products.category, `%${query}%`)
        )
      )
      .orderBy(desc(products.createdAt));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(
        or(
          lte(products.warehouseStock, products.minStockLevel),
          lte(products.storeStock, products.minStockLevel)
        )
      )
      .orderBy(desc(products.createdAt));
  }

  // Simple implementations for other methods...
  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    return db.select().from(customers).limit(limit).offset(offset).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customerData = {
      ...insertCustomer,
      customerId: `CUST${String(Date.now()).slice(-6)}`, // Generate a simple customer ID
    };
    try {
      const [customer] = await db.insert(customers).values(customerData).returning();
      return customer;
    } catch (error) {
      console.error('Customer creation error:', error);
      // If customerId conflict, try again with different ID
      const retryData = {
        ...insertCustomer,
        customerId: `CUST${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      };
      const [customer] = await db.insert(customers).values(retryData).returning();
      return customer;
    }
  }

  async updateCustomer(id: number, updateCustomer: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...updateCustomer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return db
      .select()
      .from(customers)
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(customers.customerId, `%${query}%`)
        )
      )
      .orderBy(desc(customers.createdAt));
  }

  // Invoices
  async getInvoices(limit = 50, offset = 0): Promise<Invoice[]> {
    return db.select().from(invoices).limit(limit).offset(offset).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoiceData = {
      ...insertInvoice,
      issueDate: typeof insertInvoice.issueDate === 'string' ? insertInvoice.issueDate : insertInvoice.issueDate.toISOString().split('T')[0],
      dueDate: typeof insertInvoice.dueDate === 'string' ? insertInvoice.dueDate : insertInvoice.dueDate.toISOString().split('T')[0],
    };
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async updateInvoice(id: number, updateInvoice: Partial<InsertInvoice>): Promise<Invoice> {
    const invoiceData = {
      ...updateInvoice,
      updatedAt: new Date(),
    };
    
    // Convert dates to strings if they are Date objects
    if (invoiceData.issueDate && typeof invoiceData.issueDate !== 'string') {
      invoiceData.issueDate = invoiceData.issueDate.toISOString().split('T')[0];
    }
    if (invoiceData.dueDate && typeof invoiceData.dueDate !== 'string') {
      invoiceData.dueDate = invoiceData.dueDate.toISOString().split('T')[0];
    }
    
    const [invoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    // First delete all invoice items for this invoice
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    // Then delete the invoice itself
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db.insert(invoiceItems).values(insertItem).returning();
    return item;
  }

  // Other entities - simplified implementations
  async getTechnicians(): Promise<Technician[]> { return []; }
  async getTechnician(): Promise<Technician | undefined> { return undefined; }
  async createTechnician(tech: InsertTechnician): Promise<Technician> { return tech as Technician; }
  async updateTechnician(id: number, tech: Partial<InsertTechnician>): Promise<Technician> { return tech as Technician; }
  async deleteTechnician(): Promise<void> { }

  async getTransfers(): Promise<Transfer[]> { return []; }
  async getTransfer(): Promise<Transfer | undefined> { return undefined; }
  async createTransfer(transfer: InsertTransfer): Promise<Transfer> { return transfer as Transfer; }
  async updateTransfer(id: number, transfer: Partial<InsertTransfer>): Promise<Transfer> { return transfer as Transfer; }
  async deleteTransfer(): Promise<void> { }

  async getStaffVisas(): Promise<StaffVisa[]> { return []; }
  async getStaffVisa(): Promise<StaffVisa | undefined> { return undefined; }
  async createStaffVisa(visa: InsertStaffVisa): Promise<StaffVisa> { return visa as StaffVisa; }
  async updateStaffVisa(id: number, visa: Partial<InsertStaffVisa>): Promise<StaffVisa> { return visa as StaffVisa; }
  async deleteStaffVisa(): Promise<void> { }

  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalCustomers: number;
    pendingInvoices: number;
    totalProducts: number;
    lowStockCount: number;
  }> {
    try {
      const allProducts = await db.select().from(products);
      const allCustomers = await db.select().from(customers);
      const lowStock = await this.getLowStockProducts();
      
      return {
        totalRevenue: 0,
        totalCustomers: allCustomers.length,
        pendingInvoices: 0,
        totalProducts: allProducts.length,
        lowStockCount: lowStock.length,
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return {
        totalRevenue: 0,
        totalCustomers: 0,
        pendingInvoices: 0,
        totalProducts: 0,
        lowStockCount: 0,
      };
    }
  }

  async updateProductPrice(productId: number, newCost: number, quantity: number): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        cost: newCost.toString(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    return updatedProduct;
  }
}

export const storage = new DatabaseStorage();