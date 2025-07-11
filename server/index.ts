import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes_clean";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./mongodb";
import { User } from "@shared/models";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new (MemoryStore(session))({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize database with default admin user
async function initializeDatabase() {
  try {
    const adminUser = await User.findOne({ username: "admin" });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        name: "Administrator",
        role: "admin",
        permissions: {
          canManageUsers: true,
          canManageCustomers: true,
          canManageProducts: true,
          canManageInvoices: true,
          canManageTechnicians: true,
          canManageTransfers: true,
          canManageStaffVisas: true,
          canViewReports: true,
          canManageSettings: true,
          canViewPrices: true,
          canViewCosts: true,
          canViewFinancials: true,
        },
      });
      console.log("Created default admin user (admin/admin123)");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

(async () => {
  // Connect to MongoDB first
  await connectToDatabase();
  
  const server = await registerRoutes(app);
  
  // Initialize database after connection
  await initializeDatabase();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
