import {
  users,
  customers,
  products,
  invoices,
  invoiceItems,
  technicians,
  transfers,
  staffVisas,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Technician,
  type InsertTechnician,
  type Transfer,
  type InsertTransfer,
  type StaffVisa,
  type InsertStaffVisa,
  priceHistory,
  salesActivity,
  systemAlerts,
  systemSettings,
  technicianActivity,
  type PriceHistory,
  type SalesActivity,
  type SystemAlert,
  type SystemSetting,
  type TechnicianActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, count, sql, and } from "drizzle-orm";
import bcrypt from "bcrypt";

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

  // Price management (simplified)
  updateProductPrice?(productId: number, newCost: number, quantity: number): Promise<Product>;
  
  // System alerts (simplified)
  createAlert?(type: string, title: string, message: string, productId?: number, referenceId?: number, priority?: string): Promise<any>;
  getAlerts?(isRead?: boolean): Promise<any[]>;
  markAlertAsRead?(alertId: number): Promise<void>;

  // Settings management
  getSetting(key: string): Promise<SystemSetting | undefined>;
  updateSetting(key: string, value: string, description?: string, category?: string): Promise<SystemSetting>;

  // Technician Activity tracking
  createTechnicianActivity(activity: {
    technicianId?: number;
    technicianName: string;
    activityType: string;
    productId?: number;
    productName?: string;
    quantity: number;
    transferId?: number;
    notes?: string;
    workDate?: Date;
  }): Promise<any>;
  getTechnicianActivities(filters?: {
    technicianName?: string;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }): Promise<any[]>;
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
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      } as any)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const updateData: any = { ...updateUser };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    updateData.updatedAt = new Date();
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Customers
  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    // Auto-generate customer ID
    const existingCustomers = await db.select({ id: customers.id }).from(customers);
    const nextNumber = existingCustomers.length + 1;
    const customerData = {
      ...insertCustomer,
      customerId: `CUST${nextNumber.toString().padStart(4, '0')}`
    };
    

    
    const [customer] = await db
      .insert(customers)
      .values(customerData)
      .returning();
    return customer;
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
    return await db
      .select()
      .from(customers)
      .where(
        like(customers.name, `%${query}%`)
      )
      .orderBy(asc(customers.name));
  }

  // Products
  async getProducts(limit = 50, offset = 0): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
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
    return await db
      .select()
      .from(products)
      .where(
        like(products.name, `%${query}%`)
      )
      .orderBy(asc(products.name));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        sql`(${products.warehouseStock} + ${products.storeStock}) <= ${products.minStockLevel}`
      )
      .orderBy(asc(products.name));
  }

  // Invoices
  async getInvoices(limit = 50, offset = 0): Promise<Invoice[]> {
    const invoicesWithCustomers = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        tax: invoices.tax,
        total: invoices.total,
        status: invoices.status,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          customerId: customers.customerId,
        }
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);
    
    return invoicesWithCustomers as any;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, updateInvoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...updateInvoice, updatedAt: new Date() })
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
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db
      .insert(invoiceItems)
      .values(insertItem)
      .returning();
    return item;
  }

  // Technicians
  async getTechnicians(limit = 50, offset = 0): Promise<Technician[]> {
    return await db
      .select()
      .from(technicians)
      .orderBy(desc(technicians.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician || undefined;
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const [technician] = await db
      .insert(technicians)
      .values(insertTechnician)
      .returning();
    return technician;
  }

  async updateTechnician(id: number, updateTechnician: Partial<InsertTechnician>): Promise<Technician> {
    const [technician] = await db
      .update(technicians)
      .set({ ...updateTechnician, updatedAt: new Date() })
      .where(eq(technicians.id, id))
      .returning();
    return technician;
  }

  async deleteTechnician(id: number): Promise<void> {
    await db.delete(technicians).where(eq(technicians.id, id));
  }

  // Transfers
  async getTransfers(limit = 50, offset = 0): Promise<Transfer[]> {
    return await db
      .select()
      .from(transfers)
      .orderBy(desc(transfers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTransfer(id: number): Promise<Transfer | undefined> {
    const [transfer] = await db.select().from(transfers).where(eq(transfers.id, id));
    return transfer || undefined;
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const [transfer] = await db
      .insert(transfers)
      .values(insertTransfer)
      .returning();
    return transfer;
  }

  async updateTransfer(id: number, updateTransfer: Partial<InsertTransfer>): Promise<Transfer> {
    const [transfer] = await db
      .update(transfers)
      .set({ ...updateTransfer, updatedAt: new Date() })
      .where(eq(transfers.id, id))
      .returning();
    return transfer;
  }

  async deleteTransfer(id: number): Promise<void> {
    await db.delete(transfers).where(eq(transfers.id, id));
  }

  // Staff Visas
  async getStaffVisas(limit = 50, offset = 0): Promise<StaffVisa[]> {
    return await db
      .select()
      .from(staffVisas)
      .orderBy(desc(staffVisas.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getStaffVisa(id: number): Promise<StaffVisa | undefined> {
    const [visa] = await db.select().from(staffVisas).where(eq(staffVisas.id, id));
    return visa || undefined;
  }

  async createStaffVisa(insertVisa: InsertStaffVisa): Promise<StaffVisa> {
    const [visa] = await db
      .insert(staffVisas)
      .values(insertVisa)
      .returning();
    return visa;
  }

  async updateStaffVisa(id: number, updateVisa: Partial<InsertStaffVisa>): Promise<StaffVisa> {
    const [visa] = await db
      .update(staffVisas)
      .set({ ...updateVisa, updatedAt: new Date() })
      .where(eq(staffVisas.id, id))
      .returning();
    return visa;
  }

  async deleteStaffVisa(id: number): Promise<void> {
    await db.delete(staffVisas).where(eq(staffVisas.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalCustomers: number;
    pendingInvoices: number;
    totalProducts: number;
    lowStockCount: number;
  }> {
    const [revenueResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
      })
      .from(invoices)
      .where(eq(invoices.status, "paid"));

    const [customersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.status, "active"));

    const [pendingInvoicesResult] = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.status, "pending"));

    const [productsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, "active"));

    const lowStockProducts = await this.getLowStockProducts();

    return {
      totalRevenue: Number(revenueResult.total) || 0,
      totalCustomers: customersResult.count || 0,
      pendingInvoices: pendingInvoicesResult.count || 0,
      totalProducts: productsResult.count || 0,
      lowStockCount: lowStockProducts.length || 0,
    };
  }

  // Price management and averaging
  async updateProductPrice(productId: number, newCost: number, quantity: number): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate new average cost
    const newAverageCost = await this.calculateAveragePrice(productId, newCost, quantity);

    // Record price history
    await db.insert(priceHistory).values({
      productId,
      oldCost: product.cost ? parseFloat(product.cost) : null,
      newCost: newCost,
      quantity,
      purchaseDate: new Date(),
    });

    // Update product with new average cost
    const [updatedProduct] = await db
      .update(products)
      .set({
        cost: newCost.toString(),
        averageCost: newAverageCost.toString(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    return updatedProduct;
  }

  async calculateAveragePrice(productId: number, newCost: number, newQuantity: number): Promise<number> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const currentStock = product.warehouseStock + product.storeStock;
    const currentCost = product.averageCost ? parseFloat(product.averageCost) : (product.cost ? parseFloat(product.cost) : newCost);

    // Calculate weighted average: (current_stock * current_cost + new_quantity * new_cost) / total_stock
    const totalValue = (currentStock * currentCost) + (newQuantity * newCost);
    const totalQuantity = currentStock + newQuantity;

    return totalQuantity > 0 ? totalValue / totalQuantity : newCost;
  }

  // Sales activity tracking
  async recordSalesActivity(
    productId: number, 
    quantity: number, 
    unitPrice: number, 
    activityType: string, 
    fromLocation?: string, 
    toLocation?: string, 
    referenceId?: number
  ): Promise<void> {
    const totalAmount = quantity * unitPrice;

    await db.insert(salesActivity).values({
      productId,
      quantity,
      unitPrice: unitPrice.toString(),
      totalAmount: totalAmount.toString(),
      activityType,
      fromLocation,
      toLocation,
      referenceId,
    });

    // Update last sale date and total sold for the product
    if (activityType === 'sale') {
      const product = await this.getProduct(productId);
      if (product) {
        await db
          .update(products)
          .set({
            lastSaleDate: new Date(),
            totalSold: product.totalSold + quantity,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
      }
    }
  }

  // Low moving stock detection
  async getLowMovingStock(daysSinceLastSale: number = 30): Promise<Product[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastSale);

    const lowMovingProducts = await db
      .select()
      .from(products)
      .where(
        sql`(${products.lastSaleDate} IS NULL OR ${products.lastSaleDate} < ${cutoffDate}) 
            AND (${products.warehouseStock} + ${products.storeStock}) > 0`
      );

    return lowMovingProducts;
  }

  // System alerts
  async createAlert(
    type: string, 
    title: string, 
    message: string, 
    productId?: number, 
    referenceId?: number, 
    priority: string = 'medium'
  ): Promise<SystemAlert> {
    const [alert] = await db
      .insert(systemAlerts)
      .values({
        type,
        title,
        message,
        productId,
        referenceId,
        priority,
      })
      .returning();

    return alert;
  }

  async getAlerts(isRead?: boolean): Promise<SystemAlert[]> {
    let query = db.select().from(systemAlerts);
    
    if (isRead !== undefined) {
      query = query.where(eq(systemAlerts.isRead, isRead));
    }

    return await query.orderBy(desc(systemAlerts.createdAt));
  }

  async markAlertAsRead(alertId: number): Promise<void> {
    await db
      .update(systemAlerts)
      .set({ isRead: true })
      .where(eq(systemAlerts.id, alertId));
  }

  // Settings management
  async getSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    
    return setting || undefined;
  }

  async updateSetting(
    key: string, 
    value: string, 
    description?: string, 
    category: string = 'general'
  ): Promise<SystemSetting> {
    const existing = await this.getSetting(key);

    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({
          value,
          description: description || existing.description,
          category,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key))
        .returning();
      
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({
          key,
          value,
          description,
          category,
        })
        .returning();
      
      return created;
    }
  }

  // Technician Activity tracking
  async createTechnicianActivity(activity: {
    technicianId?: number;
    technicianName: string;
    activityType: string;
    productId?: number;
    productName?: string;
    quantity: number;
    transferId?: number;
    notes?: string;
    workDate?: Date;
  }): Promise<TechnicianActivity> {
    const [created] = await db
      .insert(technicianActivity)
      .values({
        technicianId: activity.technicianId,
        technicianName: activity.technicianName,
        activityType: activity.activityType,
        productId: activity.productId,
        productName: activity.productName,
        quantity: activity.quantity,
        transferId: activity.transferId,
        notes: activity.notes,
        workDate: activity.workDate || new Date(),
      })
      .returning();
    
    return created;
  }

  async getTechnicianActivities(filters?: {
    technicianName?: string;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }): Promise<TechnicianActivity[]> {
    let query = db.select().from(technicianActivity);
    
    if (filters) {
      const conditions = [];
      
      if (filters.technicianName) {
        conditions.push(eq(technicianActivity.technicianName, filters.technicianName));
      }
      
      if (filters.activityType) {
        conditions.push(eq(technicianActivity.activityType, filters.activityType));
      }
      
      if (filters.startDate) {
        conditions.push(sql`${technicianActivity.workDate} >= ${filters.startDate}`);
      }
      
      if (filters.endDate) {
        conditions.push(sql`${technicianActivity.workDate} <= ${filters.endDate}`);
      }
      
      if (filters.month && filters.year) {
        conditions.push(
          sql`EXTRACT(month FROM ${technicianActivity.workDate}) = ${parseInt(filters.month)}`
        );
        conditions.push(
          sql`EXTRACT(year FROM ${technicianActivity.workDate}) = ${parseInt(filters.year)}`
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(technicianActivity.workDate));
  }
}

export const storage = new DatabaseStorage();
