import bcrypt from 'bcrypt';
import { 
  User, Customer, Product, Invoice, Technician, Transfer, StaffVisa, 
  SystemSetting, TechnicianActivity, SystemAlert,
  IUser, ICustomer, IProduct, IInvoice, ITechnician, ITransfer, IStaffVisa,
  ISystemSetting, ITechnicianActivity, ISystemAlert
} from '../shared/models.js';

// Type definitions for inserts (without _id and auto-generated fields)
export type InsertUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertCustomer = Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertProduct = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertInvoice = Omit<IInvoice, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertTechnician = Omit<ITechnician, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertTransfer = Omit<ITransfer, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertStaffVisa = Omit<IStaffVisa, '_id' | 'createdAt' | 'updatedAt'>;

export interface IStorage {
  // Users
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<void>;

  // Customers
  getCustomers(limit?: number, offset?: number): Promise<ICustomer[]>;
  getCustomer(id: string): Promise<ICustomer | null>;
  createCustomer(customer: InsertCustomer): Promise<ICustomer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<ICustomer | null>;
  deleteCustomer(id: string): Promise<void>;
  searchCustomers(query: string): Promise<ICustomer[]>;

  // Products
  getProducts(limit?: number, offset?: number): Promise<IProduct[]>;
  getProduct(id: string): Promise<IProduct | null>;
  createProduct(product: InsertProduct): Promise<IProduct>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<IProduct | null>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(query: string): Promise<IProduct[]>;
  getLowStockProducts(): Promise<IProduct[]>;

  // Invoices
  getInvoices(limit?: number, offset?: number): Promise<IInvoice[]>;
  getInvoice(id: string): Promise<IInvoice | null>;
  createInvoice(invoice: InsertInvoice): Promise<IInvoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<IInvoice | null>;
  deleteInvoice(id: string): Promise<void>;

  // Technicians
  getTechnicians(limit?: number, offset?: number): Promise<ITechnician[]>;
  getTechnician(id: string): Promise<ITechnician | null>;
  createTechnician(technician: InsertTechnician): Promise<ITechnician>;
  updateTechnician(id: string, technician: Partial<InsertTechnician>): Promise<ITechnician | null>;
  deleteTechnician(id: string): Promise<void>;

  // Transfers
  getTransfers(limit?: number, offset?: number): Promise<ITransfer[]>;
  getTransfer(id: string): Promise<ITransfer | null>;
  createTransfer(transfer: InsertTransfer): Promise<ITransfer>;
  updateTransfer(id: string, transfer: Partial<InsertTransfer>): Promise<ITransfer | null>;
  deleteTransfer(id: string): Promise<void>;

  // Staff Visas
  getStaffVisas(limit?: number, offset?: number): Promise<IStaffVisa[]>;
  getStaffVisa(id: string): Promise<IStaffVisa | null>;
  createStaffVisa(visa: InsertStaffVisa): Promise<IStaffVisa>;
  updateStaffVisa(id: string, visa: Partial<InsertStaffVisa>): Promise<IStaffVisa | null>;
  deleteStaffVisa(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: number;
    totalCustomers: number;
    pendingInvoices: number;
    totalProducts: number;
    lowStockCount: number;
  }>;

  // Settings
  getSetting(key: string): Promise<ISystemSetting | null>;
  updateSetting(key: string, value: string, description?: string, category?: string): Promise<ISystemSetting>;

  // Technician Activities
  createTechnicianActivity(activity: {
    technicianId?: string;
    technicianName: string;
    activityType: string;
    productId?: string;
    productName?: string;
    quantity: number;
    transferId?: string;
    notes?: string;
    workDate?: Date;
  }): Promise<ITechnicianActivity>;
  getTechnicianActivities(filters?: {
    technicianName?: string;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }): Promise<ITechnicianActivity[]>;

  // Price management
  updateProductPrice(productId: string, newCost: number, quantity: number): Promise<IProduct | null>;
  
  // System alerts
  createAlert(type: string, title: string, message: string, productId?: string, referenceId?: string, priority?: string): Promise<ISystemAlert>;
  getAlerts(isRead?: boolean): Promise<ISystemAlert[]>;
  markAlertAsRead(alertId: string): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user = new User({
      ...insertUser,
      password: hashedPassword,
    });
    return await user.save();
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<IUser | null> {
    if (updateUser.password) {
      updateUser.password = await bcrypt.hash(updateUser.password, 10);
    }
    return await User.findByIdAndUpdate(id, { ...updateUser, updatedAt: new Date() }, { new: true });
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }

  // Customers
  async getCustomers(limit = 50, offset = 0): Promise<ICustomer[]> {
    return await Customer.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getCustomer(id: string): Promise<ICustomer | null> {
    return await Customer.findById(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<ICustomer> {
    const customer = new Customer(insertCustomer);
    return await customer.save();
  }

  async updateCustomer(id: string, updateCustomer: Partial<InsertCustomer>): Promise<ICustomer | null> {
    return await Customer.findByIdAndUpdate(id, { ...updateCustomer, updatedAt: new Date() }, { new: true });
  }

  async deleteCustomer(id: string): Promise<void> {
    await Customer.findByIdAndDelete(id);
  }

  async searchCustomers(query: string): Promise<ICustomer[]> {
    return await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { customerId: { $regex: query, $options: 'i' } }
      ]
    });
  }

  // Products
  async getProducts(limit = 50, offset = 0): Promise<IProduct[]> {
    return await Product.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getProduct(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<IProduct> {
    const product = new Product(insertProduct);
    return await product.save();
  }

  async updateProduct(id: string, updateProduct: Partial<InsertProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, { ...updateProduct, updatedAt: new Date() }, { new: true });
  }

  async deleteProduct(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    return await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
  }

  async getLowStockProducts(): Promise<IProduct[]> {
    return await Product.find({
      $expr: {
        $lt: [{ $add: ["$warehouseStock", "$storeStock"] }, "$minStockLevel"]
      }
    });
  }

  // Invoices
  async getInvoices(limit = 50, offset = 0): Promise<IInvoice[]> {
    return await Invoice.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getInvoice(id: string): Promise<IInvoice | null> {
    return await Invoice.findById(id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<IInvoice> {
    const invoice = new Invoice(insertInvoice);
    const savedInvoice = await invoice.save();

    // Update store stock for each item
    for (const item of insertInvoice.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          storeStock: -item.quantity,
          totalSold: item.quantity 
        },
        lastSaleDate: new Date()
      });
    }

    return savedInvoice;
  }

  async updateInvoice(id: string, updateInvoice: Partial<InsertInvoice>): Promise<IInvoice | null> {
    return await Invoice.findByIdAndUpdate(id, { ...updateInvoice, updatedAt: new Date() }, { new: true });
  }

  async deleteInvoice(id: string): Promise<void> {
    await Invoice.findByIdAndDelete(id);
  }

  // Technicians
  async getTechnicians(limit = 50, offset = 0): Promise<ITechnician[]> {
    return await Technician.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getTechnician(id: string): Promise<ITechnician | null> {
    return await Technician.findById(id);
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<ITechnician> {
    const technician = new Technician(insertTechnician);
    return await technician.save();
  }

  async updateTechnician(id: string, updateTechnician: Partial<InsertTechnician>): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(id, { ...updateTechnician, updatedAt: new Date() }, { new: true });
  }

  async deleteTechnician(id: string): Promise<void> {
    await Technician.findByIdAndDelete(id);
  }

  // Transfers
  async getTransfers(limit = 50, offset = 0): Promise<ITransfer[]> {
    return await Transfer.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getTransfer(id: string): Promise<ITransfer | null> {
    return await Transfer.findById(id);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<ITransfer> {
    const transfer = new Transfer(insertTransfer);
    const savedTransfer = await transfer.save();

    // Create technician activity if technician is assigned
    if (insertTransfer.technicianName) {
      await this.createTechnicianActivity({
        technicianName: insertTransfer.technicianName,
        activityType: insertTransfer.activityType || 'transfer',
        productId: insertTransfer.productId,
        productName: insertTransfer.productName,
        quantity: insertTransfer.quantity,
        transferId: savedTransfer._id.toString(),
        notes: insertTransfer.notes,
        workDate: new Date()
      });
    }

    return savedTransfer;
  }

  async updateTransfer(id: string, updateTransfer: Partial<InsertTransfer>): Promise<ITransfer | null> {
    return await Transfer.findByIdAndUpdate(id, { ...updateTransfer, updatedAt: new Date() }, { new: true });
  }

  async deleteTransfer(id: string): Promise<void> {
    await Transfer.findByIdAndDelete(id);
  }

  // Staff Visas
  async getStaffVisas(limit = 50, offset = 0): Promise<IStaffVisa[]> {
    return await StaffVisa.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }

  async getStaffVisa(id: string): Promise<IStaffVisa | null> {
    return await StaffVisa.findById(id);
  }

  async createStaffVisa(insertVisa: InsertStaffVisa): Promise<IStaffVisa> {
    const visa = new StaffVisa(insertVisa);
    return await visa.save();
  }

  async updateStaffVisa(id: string, updateVisa: Partial<InsertStaffVisa>): Promise<IStaffVisa | null> {
    return await StaffVisa.findByIdAndUpdate(id, { ...updateVisa, updatedAt: new Date() }, { new: true });
  }

  async deleteStaffVisa(id: string): Promise<void> {
    await StaffVisa.findByIdAndDelete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalCustomers: number;
    pendingInvoices: number;
    totalProducts: number;
    lowStockCount: number;
  }> {
    const [totalRevenue, totalCustomers, pendingInvoices, totalProducts, lowStockProducts] = await Promise.all([
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Customer.countDocuments(),
      Invoice.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Product.find({
        $expr: {
          $lt: [{ $add: ["$warehouseStock", "$storeStock"] }, "$minStockLevel"]
        }
      })
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      pendingInvoices,
      totalProducts,
      lowStockCount: lowStockProducts.length
    };
  }

  // Settings
  async getSetting(key: string): Promise<ISystemSetting | null> {
    return await SystemSetting.findOne({ key });
  }

  async updateSetting(key: string, value: string, description?: string, category?: string): Promise<ISystemSetting> {
    return await SystemSetting.findOneAndUpdate(
      { key },
      { 
        key, 
        value, 
        description, 
        category, 
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );
  }

  // Technician Activities
  async createTechnicianActivity(activity: {
    technicianId?: string;
    technicianName: string;
    activityType: string;
    productId?: string;
    productName?: string;
    quantity: number;
    transferId?: string;
    notes?: string;
    workDate?: Date;
  }): Promise<ITechnicianActivity> {
    const techActivity = new TechnicianActivity({
      ...activity,
      workDate: activity.workDate || new Date()
    });
    return await techActivity.save();
  }

  async getTechnicianActivities(filters?: {
    technicianName?: string;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }): Promise<ITechnicianActivity[]> {
    const query: any = {};

    if (filters?.technicianName) {
      query.technicianName = { $regex: filters.technicianName, $options: 'i' };
    }

    if (filters?.activityType) {
      query.activityType = filters.activityType;
    }

    if (filters?.startDate && filters?.endDate) {
      query.workDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    if (filters?.month && filters?.year) {
      const year = parseInt(filters.year);
      const month = parseInt(filters.month);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.workDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return await TechnicianActivity.find(query).sort({ workDate: -1 });
  }

  // Price management
  async updateProductPrice(productId: string, newCost: number, quantity: number): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product) return null;

    const currentStock = product.warehouseStock + product.storeStock;
    const currentAverageCost = product.averageCost || product.cost || 0;
    
    const newAverageCost = currentStock > 0 
      ? ((currentAverageCost * currentStock) + (newCost * quantity)) / (currentStock + quantity)
      : newCost;

    return await Product.findByIdAndUpdate(
      productId,
      {
        averageCost: newAverageCost,
        cost: newCost,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  // System alerts
  async createAlert(type: string, title: string, message: string, productId?: string, referenceId?: string, priority = 'medium'): Promise<ISystemAlert> {
    const alert = new SystemAlert({
      type,
      title,
      message,
      productId,
      referenceId,
      priority
    });
    return await alert.save();
  }

  async getAlerts(isRead?: boolean): Promise<ISystemAlert[]> {
    const query = isRead !== undefined ? { isRead } : {};
    return await SystemAlert.find(query).sort({ createdAt: -1 });
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await SystemAlert.findByIdAndUpdate(alertId, { isRead: true });
  }
}

export const storage = new MongoDBStorage();