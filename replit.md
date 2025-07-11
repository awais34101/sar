# CRM Business System

## Overview

This is a full-stack CRM (Customer Relationship Management) system built with React TypeScript frontend and Express.js backend. The application manages business operations including inventory management, customer relations, invoicing, technician scheduling, and staff visa tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for authentication and global state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: BCrypt for password hashing
- **Database Provider**: MongoDB Atlas (cloud MongoDB)
- **API Design**: RESTful API with JSON responses

### UI Component System
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Design System**: "New York" style variant with neutral color scheme
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Built-in accessibility features through Radix UI components

## Key Components

### Authentication System
- Context-based authentication with localStorage persistence
- Role-based access control with granular permissions
- Session management with automatic logout on invalid sessions
- Password hashing using BCrypt

### Database Schema
- **Users**: Authentication and role management
- **Customers**: Customer information and relationship management
- **Products**: Inventory management with warehouse and store stock tracking
- **Invoices**: Billing and invoice management with line items
- **Technicians**: Service technician management
- **Transfers**: Inventory transfer tracking between locations
- **Staff Visas**: Employee visa and documentation tracking

### Business Modules
1. **Dashboard**: Overview of key business metrics and low stock alerts
2. **Warehouse Management**: Product inventory tracking and management
3. **Store Management**: Retail inventory and sales tracking
4. **Customer Management**: Customer database and relationship tracking
5. **Invoice Management**: Billing, invoicing, and payment tracking
6. **Technician Management**: Service technician scheduling and management
7. **Transfer Management**: Inventory movement between locations
8. **Staff Visa Management**: Employee documentation and visa tracking
9. **Settings**: System configuration and user management

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using fetch with TanStack Query
2. Express.js routes handle business logic and database operations
3. Drizzle ORM manages database queries and migrations
4. JSON responses returned to frontend for state updates

### State Management
- **Global State**: Authentication context provides user state across components
- **Server State**: TanStack Query manages API data with caching and synchronization
- **Local State**: React useState for component-specific state management

### Authentication Flow
1. User submits credentials through login form
2. Backend validates credentials against database
3. Successful login returns user data (without password)
4. Frontend stores user data in localStorage and context
5. Protected routes check authentication status

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing library
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **mongoose**: MongoDB object modeling for Node.js
- **mongodb**: MongoDB driver for Node.js
- **bcrypt**: Password hashing library
- **express**: Web framework for Node.js
- **tsx**: TypeScript execution environment

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation in watch mode
- Automatic database schema synchronization with `drizzle-kit push`

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles backend code to `dist/index.js`
- Environment variables required: `MONGODB_URL` or `DATABASE_URL`

### Database Management
- MongoDB models defined in `shared/models.ts`
- MongoDB connection handler in `server/mongodb.ts`
- Storage layer in `server/storage-mongo.ts`
- No migrations needed - MongoDB schema is flexible

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Enhanced CRM with advanced inventory management features:
  - Added automatic price averaging system for items purchased at different costs
  - Implemented low moving stock alerts for items with no sales activity
  - Added staff permission system to hide financial information from non-admin users
  - Created transfer notifications between warehouse and store locations
  - Added system alerts center for comprehensive notification management
  - Enhanced database schema with price history, sales activity, and alerts tracking
- July 07, 2025. Final implementation with simplified Quick Add Product:
  - Removed category requirement from Quick Add Product (only asks for product name)
  - Implemented duplicate prevention system for products
  - Added bulk purchase invoice system for adding multiple items at once
  - Implemented automatic inventory deduction from store stock during sales
  - Fixed all database connection and API endpoint issues
  - System now fully operational with streamlined workflow
- July 07, 2025. Production-ready system cleanup:
  - Removed all "$" currency symbols from input fields and displays
  - Cleared all default values from input boxes (no more "0", "1", or "0.00" defaults)
  - Removed all demo/sample data from database
  - Added advanced technician filtering by name, activity type, and date ranges
  - System ready for production use with clean, empty database
  - Only admin user (username: admin, password: admin123) remains for initial access
  - Removed SKU column from all product displays - now shows only product names
- July 07, 2025. Simplified customer creation system:
  - Removed Customer ID field from customer creation form
  - System now auto-generates customer IDs (CUST0001, CUST0002, etc.)
  - Customer creation now only requires customer name - all other fields optional
  - Updated schema validation to handle auto-generated IDs properly
  - Successfully tested - creates customers with sequential auto-generated IDs
- July 07, 2025. Enhanced invoice system with immediate processing:
  - Fixed invoice creation API call parameter order issue
  - Removed default values from invoice quantity fields (now empty instead of "1" or "0")
  - Changed default invoice status from "draft" to "paid" for immediate processing
  - Enhanced invoice queries to include customer names (no more "unknown customer")
  - Automatic inventory deduction from store stock when creating invoices
  - Invoice creation now immediately reduces store inventory and sets status to "paid"
- July 07, 2025. UI improvements and real-time inventory updates:
  - Moved "Top Value Products" and "Store Analytics" from Store page to Dashboard
  - Removed Quick Actions from Store page for cleaner layout
  - Added Sales Analytics to Dashboard: Today's Sales, Yesterday's Sales, This Month, Last Month
  - Fixed configurable tax rate system - now properly uses Settings value instead of hardcoded 8%
  - Fixed real-time inventory updates - store inventory now updates immediately after invoice creation
  - Added automatic cache invalidation for products data when invoices are created/updated
- July 07, 2025. Enhanced technician activity tracking system:
  - Added comprehensive technician activity tracking when transfers are created
  - When a technician is selected for a transfer (e.g., repair 20 PCs), the system automatically records this in their performance report
  - New database table `technician_activity` tracks all technician work with quantity, activity type, and product details
  - Added API endpoints `/api/technician-activities` and enhanced `/api/technician-stats` for detailed reporting
  - Technician reports now show actual work performed including quantities repaired, transferred, or serviced
  - System automatically links transfer activities to technician performance tracking
- July 07, 2025. Production deployment preparation:
  - Created comprehensive deployment configuration for Render platform
  - Added AWS S3 integration for cloud file storage with complete upload system
  - Implemented health check endpoint for production monitoring
  - Created deployment documentation with step-by-step guides
  - Added Docker configuration for containerized deployment
  - Set up environment variable templates for secure configuration
  - Fixed all settings persistence issues - tax rates now save correctly across page refreshes
  - System now behaves like a real business CRM with proper data persistence
- July 11, 2025. MongoDB Database Migration:
  - Migrated from PostgreSQL with Drizzle ORM to MongoDB with Mongoose
  - Created new MongoDB models in shared/models.ts with comprehensive schemas
  - Implemented MongoDB storage layer in server/storage-mongo.ts
  - Added MongoDB connection handler in server/mongodb.ts
  - Removed all PostgreSQL dependencies (drizzle-orm, @neondatabase/serverless)
  - Updated server infrastructure to use MongoDB connection
  - Created MongoDB deployment documentation
  - System now ready for deployment with MongoDB Atlas or other MongoDB services

## User Preferences

Preferred communication style: Simple, everyday language.