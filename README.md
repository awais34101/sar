# CRM Business System

A comprehensive Customer Relationship Management (CRM) and inventory management system built with modern web technologies.

## 🚀 Features

### Business Management
- **Customer Management**: Complete customer database with contact tracking
- **Product Inventory**: Warehouse and store stock management
- **Invoice Management**: Professional invoicing with automatic calculations
- **Technician Scheduling**: Service technician management and activity tracking
- **Transfer Management**: Inventory movement between locations
- **Staff Visa Management**: Employee documentation tracking

### Analytics & Reporting
- **Dashboard Analytics**: Real-time business metrics and KPIs
- **Sales Analytics**: Daily, monthly, and comparative revenue reports
- **Inventory Analytics**: Stock levels and value analysis
- **Technician Performance**: Activity tracking and performance metrics

### System Features
- **User Authentication**: Secure login with role-based permissions
- **Settings Management**: Configurable tax rates and system preferences
- **Alert System**: Low stock alerts and notifications
- **Real-time Updates**: Live data synchronization
- **File Management**: AWS S3 integration for document storage

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Query** for state management
- **Wouter** for routing
- **React Hook Form** + **Zod** validation
- **Vite** for build tooling

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **PostgreSQL** with **Drizzle ORM**
- **AWS S3** for file storage
- **BCrypt** for authentication

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   PostgreSQL    │
│                 │────│                 │────│                 │
│  - Components   │    │  - API Routes   │    │  - Business     │
│  - State Mgmt   │    │  - Business     │    │    Data         │
│  - UI/UX        │    │    Logic        │    │  - Relationships│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │      AWS S3     │
                       │                 │
                       │  - File Storage │
                       │  - Documents    │
                       │  - Images       │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- AWS S3 bucket (for file storage)

### Local Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-business-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5000
   - Login with: admin / admin123

### Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities
│   │   ├── hooks/         # Custom hooks
│   │   └── App.tsx        # Main app component
├── server/                # Express backend
│   ├── routes_clean.ts    # API routes
│   ├── storage.ts         # Database operations
│   ├── s3.ts             # AWS S3 integration
│   └── index.ts          # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema
├── render.yaml           # Render deployment config
├── Dockerfile           # Container configuration
└── DEPLOYMENT_GUIDE.md  # Deployment instructions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Business Operations
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/technicians` - List technicians
- `POST /api/technicians` - Create technician

### Analytics
- `GET /api/dashboard/stats` - Dashboard metrics
- `GET /api/technician-stats` - Technician performance
- `GET /api/sales-analytics` - Sales reports

### Settings
- `GET /api/settings/:key` - Get setting
- `PUT /api/settings/:key` - Update setting

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and roles
- **customers** - Customer information
- **products** - Product inventory
- **invoices** - Invoice management
- **invoice_items** - Invoice line items
- **technicians** - Technician information
- **transfers** - Inventory transfers
- **staff_visas** - Staff documentation

### System Tables
- **system_settings** - Application configuration
- **system_alerts** - Notifications
- **technician_activity** - Performance tracking

## 🔐 Security

- **Authentication**: BCrypt password hashing
- **Session Management**: Secure session handling
- **Input Validation**: Comprehensive data validation
- **Environment Variables**: Secure configuration
- **HTTPS**: Encrypted communication in production

## 📊 Business Features

### Dashboard
- Total revenue and customer metrics
- Pending invoices and alerts
- Sales analytics with comparisons
- Top performing products
- Low stock notifications

### Inventory Management
- Warehouse and store stock tracking
- Automatic stock deduction on sales
- Low stock alerts and notifications
- Product price averaging system
- Transfer management between locations

### Invoice System
- Professional invoice generation
- Automatic tax calculations
- Multiple payment status tracking
- Real-time inventory updates
- Customer relationship integration

### Technician Tracking
- Service activity logging
- Performance metrics
- Work assignment tracking
- Monthly/yearly reports
- Transfer activity integration

## 🚀 Deployment Options

### Render (Recommended)
- Automatic deployments from Git
- Managed PostgreSQL database
- Environment variable management
- Health check monitoring
- SSL certificates included

### Alternative Platforms
- AWS (EC2 + RDS + S3)
- Google Cloud Platform
- Azure
- DigitalOcean
- Heroku

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Application
SESSION_SECRET=your_session_secret
NODE_ENV=production
PORT=5000
```

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement frontend components
   - Add backend API routes
   - Update database schema if needed
   - Test functionality

2. **Code Quality**
   - TypeScript type checking
   - ESLint code linting
   - Database schema validation
   - API endpoint testing

3. **Deployment**
   - Push to main branch
   - Automatic deployment to Render
   - Database migrations run automatically
   - Health checks verify deployment

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Dark Mode**: System preference detection
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback

## 📈 Performance

- **Frontend**: Vite build optimization
- **Backend**: Express.js with efficient queries
- **Database**: PostgreSQL with indexed queries
- **Caching**: TanStack Query for client-side caching
- **File Storage**: AWS S3 for scalable file management

## 🧪 Testing

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: User workflow testing
- **Performance Tests**: Load and stress testing

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Project Overview](./PROJECT_OVERVIEW.md)
- [API Documentation](./API_DOCS.md)
- [Database Schema](./shared/schema.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review the troubleshooting guide
- Contact the development team

---

**Built with ❤️ for modern business management**