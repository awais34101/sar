import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-mongo";
import bcrypt from "bcrypt";
// MongoDB schemas - we'll do basic validation in the routes

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize database with admin user
  app.post("/api/init", async (req, res) => {
    try {
      // Check if admin user exists
      const existingAdmin = await storage.getUserByUsername("admin");
      
      if (!existingAdmin) {
        // Create admin user
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await storage.createUser({
          username: "admin",
          email: "admin@example.com",
          password: hashedPassword,
          name: "Administrator",
          role: "admin",
          permissions: {
            canViewPrices: true,
            canViewCosts: true,
            canManageProducts: true,
            canManageCustomers: true,
            canManageInvoices: true,
            canManageUsers: true,
            canViewFinancials: true,
          },
        });


      }

      res.json({ success: true });
    } catch (error) {
      console.error("Init error:", error);
      res.status(500).json({ error: "Failed to initialize" });
    }
  });

  // Authentication endpoints
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Dashboard endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const products = await storage.getProducts(limit, offset);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Get low stock products error:", error);
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.post("/api/products/:id/update-price", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { cost, quantity, location } = req.body;
      
      if (!cost || !quantity || !location) {
        return res.status(400).json({ error: "Cost, quantity, and location are required" });
      }

      // Get current product
      const currentProduct = await storage.getProduct(productId);
      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Update inventory based on location
      if (location === "warehouse") {
        await storage.updateProduct(productId, {
          warehouseStock: currentProduct.warehouseStock + quantity,
          cost: cost.toString(),
        });
      } else if (location === "store") {
        await storage.updateProduct(productId, {
          storeStock: currentProduct.storeStock + quantity,
          cost: cost.toString(),
        });
      }

      const updatedProduct = await storage.getProduct(productId);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Update product price error:", error);
      res.status(500).json({ error: "Failed to update product price" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), productData);
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Customers endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const customers = await storage.getCustomers(limit, offset);
      res.json(customers);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const customers = await storage.searchCustomers(query);
      res.json(customers);
    } catch (error) {
      console.error("Search customers error:", error);
      res.status(500).json({ error: "Failed to search customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), customerData);
      res.json(customer);
    } catch (error) {
      console.error("Update customer error:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      await storage.deleteCustomer(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Invoices endpoints
  app.get("/api/invoices", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const invoices = await storage.getInvoices(limit, offset);
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const result = insertInvoiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid invoice data", details: result.error.issues });
      }

      const invoice = await storage.createInvoice(result.data);
      
      // If this is a sales invoice with items, save them and deduct inventory from store
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          // Save invoice item
          const itemTotal = parseFloat(item.unitPrice) * item.quantity;
          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: itemTotal.toFixed(2),
          });
          
          // Update store stock
          const product = await storage.getProduct(item.productId);
          if (product && product.storeStock >= item.quantity) {
            await storage.updateProduct(item.productId, {
              storeStock: product.storeStock - item.quantity,
            });
          }
        }
      }
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(Number(req.params.id));
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(Number(req.params.id), invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Update invoice error:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      await storage.deleteInvoice(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete invoice error:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  app.get("/api/invoices/:id/items", async (req, res) => {
    try {
      const items = await storage.getInvoiceItems(Number(req.params.id));
      res.json(items);
    } catch (error) {
      console.error("Get invoice items error:", error);
      res.status(500).json({ error: "Failed to fetch invoice items" });
    }
  });

  app.post("/api/invoices/:id/items", async (req, res) => {
    try {
      const itemData = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Create invoice item error:", error);
      res.status(500).json({ error: "Failed to create invoice item" });
    }
  });

  // Technicians endpoints
  app.get("/api/technicians", async (req, res) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Get technicians error:", error);
      res.status(500).json({ error: "Failed to fetch technicians" });
    }
  });

  app.post("/api/technicians", async (req, res) => {
    try {
      const technicianData = insertTechnicianSchema.parse(req.body);
      const technician = await storage.createTechnician(technicianData);
      res.json(technician);
    } catch (error) {
      console.error("Create technician error:", error);
      res.status(500).json({ error: "Failed to create technician" });
    }
  });

  app.get("/api/technicians/:id", async (req, res) => {
    try {
      const technician = await storage.getTechnician(Number(req.params.id));
      if (!technician) {
        return res.status(404).json({ error: "Technician not found" });
      }
      res.json(technician);
    } catch (error) {
      console.error("Get technician error:", error);
      res.status(500).json({ error: "Failed to fetch technician" });
    }
  });

  app.patch("/api/technicians/:id", async (req, res) => {
    try {
      const technicianData = insertTechnicianSchema.partial().parse(req.body);
      const technician = await storage.updateTechnician(Number(req.params.id), technicianData);
      res.json(technician);
    } catch (error) {
      console.error("Update technician error:", error);
      res.status(500).json({ error: "Failed to update technician" });
    }
  });

  app.delete("/api/technicians/:id", async (req, res) => {
    try {
      await storage.deleteTechnician(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete technician error:", error);
      res.status(500).json({ error: "Failed to delete technician" });
    }
  });

  app.get("/api/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransfers();
      res.json(transfers);
    } catch (error) {
      console.error("Get transfers error:", error);
      res.status(500).json({ error: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", async (req, res) => {
    try {
      const transferData = {
        ...req.body,
        status: "completed" // Force immediate completion
      };
      
      // Create the transfer record
      const transfer = await storage.createTransfer(transferData);
      
      // Immediately update inventory for completed transfers
      const product = await storage.getProduct(transfer.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Update stock levels based on transfer direction
      if (transfer.fromLocation === "warehouse" && transfer.toLocation === "store") {
        // Warehouse to Store
        await storage.updateProduct(product.id, {
          warehouseStock: Math.max(0, product.warehouseStock - transfer.quantity),
          storeStock: product.storeStock + transfer.quantity
        });
      } else if (transfer.fromLocation === "store" && transfer.toLocation === "warehouse") {
        // Store to Warehouse  
        await storage.updateProduct(product.id, {
          storeStock: Math.max(0, product.storeStock - transfer.quantity),
          warehouseStock: product.warehouseStock + transfer.quantity
        });
      }

      // Record technician activity if technician is assigned
      if (transfer.technicianName && transfer.activityType) {
        try {
          await storage.createTechnicianActivity({
            technicianName: transfer.technicianName,
            activityType: transfer.activityType,
            productId: product.id,
            productName: product.name,
            quantity: transfer.quantity,
            transferId: transfer.id,
            notes: transfer.notes || `${transfer.activityType} - ${transfer.quantity} units of ${product.name}`,
            workDate: new Date()
          });
        } catch (activityError) {
          console.error("Failed to record technician activity:", activityError);
          // Don't fail the transfer if activity recording fails
        }
      }

      res.json(transfer);
    } catch (error) {
      console.error("Create transfer error:", error);
      res.status(500).json({ error: "Failed to create transfer" });
    }
  });

  app.get("/api/staff-visas", async (req, res) => {
    try {
      const visas = await storage.getStaffVisas();
      res.json(visas);
    } catch (error) {
      console.error("Get staff visas error:", error);
      res.status(500).json({ error: "Failed to fetch staff visas" });
    }
  });

  // Technician activity tracking with filtering
  app.get("/api/technician-stats", async (req, res) => {
    try {
      const { 
        technicianName, 
        activityType, 
        startDate, 
        endDate, 
        month, 
        year 
      } = req.query;

      // Get technician activities based on filters
      const activities = await storage.getTechnicianActivities({
        technicianName: technicianName as string,
        activityType: activityType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        month: month as string,
        year: year as string
      });

      // Group activities by technician and calculate totals
      const technicianStats = activities.reduce((acc, activity) => {
        const techName = activity.technicianName;
        
        if (!acc[techName]) {
          acc[techName] = {
            technicianName: techName,
            totalActivities: 0,
            totalQuantity: 0,
            activities: []
          };
        }
        
        acc[techName].totalActivities++;
        acc[techName].totalQuantity += activity.quantity;
        acc[techName].activities.push(activity);
        
        return acc;
      }, {} as Record<string, any>);

      res.json(technicianStats);
    } catch (error) {
      console.error("Get technician stats error:", error);
      res.status(500).json({ error: "Failed to fetch technician stats" });
    }
  });

  // Get all technician activities (for detailed view)
  app.get("/api/technician-activities", async (req, res) => {
    try {
      const { 
        technicianName, 
        activityType, 
        startDate, 
        endDate, 
        month, 
        year 
      } = req.query;

      const activities = await storage.getTechnicianActivities({
        technicianName: technicianName as string,
        activityType: activityType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        month: month as string,
        year: year as string
      });

      res.json(activities);
    } catch (error) {
      console.error("Get technician activities error:", error);
      res.status(500).json({ error: "Failed to fetch technician activities" });
    }
  });

  // Legacy endpoint for backward compatibility
  app.get("/api/technician-stats-old", async (req, res) => {
    try {
      const { 
        technicianName, 
        activityType, 
        startDate, 
        endDate, 
        month, 
        year 
      } = req.query;

      const transfers = await storage.getTransfers();
      
      // Apply filters
      let filteredTransfers = transfers.filter(t => t.technicianName);
      
      // Filter by technician name
      if (technicianName) {
        filteredTransfers = filteredTransfers.filter(t => 
          t.technicianName.toLowerCase().includes(technicianName.toString().toLowerCase())
        );
      }
      
      // Filter by activity type
      if (activityType && activityType !== 'all') {
        filteredTransfers = filteredTransfers.filter(t => t.activityType === activityType);
      }
      
      // Filter by date range
      if (startDate && endDate) {
        const start = new Date(startDate.toString());
        const end = new Date(endDate.toString());
        filteredTransfers = filteredTransfers.filter(t => {
          const transferDate = new Date(t.createdAt);
          return transferDate >= start && transferDate <= end;
        });
      } else if (month && year) {
        // Filter by specific month/year
        const targetMonth = parseInt(month.toString()) - 1; // JS months are 0-indexed
        const targetYear = parseInt(year.toString());
        filteredTransfers = filteredTransfers.filter(t => {
          const transferDate = new Date(t.createdAt);
          return transferDate.getMonth() === targetMonth && 
                 transferDate.getFullYear() === targetYear;
        });
      } else {
        // Default to current month if no date filter specified
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        filteredTransfers = filteredTransfers.filter(t => {
          const transferDate = new Date(t.createdAt);
          return transferDate.getMonth() === currentMonth && 
                 transferDate.getFullYear() === currentYear;
        });
      }
      
      // Group by technician and activity type
      const techStats = {};
      filteredTransfers.forEach(transfer => {
        const techName = transfer.technicianName;
        if (!techStats[techName]) {
          techStats[techName] = { 
            checks: 0, 
            repairs: 0, 
            total: 0,
            transfers: []
          };
        }
        
        if (transfer.activityType === 'check') {
          techStats[techName].checks += transfer.quantity;
        } else if (transfer.activityType === 'repair') {
          techStats[techName].repairs += transfer.quantity;
        }
        techStats[techName].total += transfer.quantity;
        techStats[techName].transfers.push({
          id: transfer.id,
          transferNumber: transfer.transferNumber,
          date: transfer.createdAt,
          quantity: transfer.quantity,
          activityType: transfer.activityType,
          fromLocation: transfer.fromLocation,
          toLocation: transfer.toLocation
        });
      });
      
      res.json(techStats);
    } catch (error) {
      console.error("Get technician stats error:", error);
      res.status(500).json({ error: "Failed to fetch technician stats" });
    }
  });

  // Simplified alert system
  app.get("/api/alerts", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Settings endpoints
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        // Return default values for known settings
        const defaults: Record<string, string> = {
          'tax_rate': '0',
        };
        return res.json({ key: req.params.key, value: defaults[req.params.key] || '' });
      }
      res.json(setting);
    } catch (error) {
      console.error("Get setting error:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value, description } = req.body;
      const setting = await storage.updateSetting(req.params.key, value, description);
      res.json(setting);
    } catch (error) {
      console.error("Update setting error:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  return httpServer;
}