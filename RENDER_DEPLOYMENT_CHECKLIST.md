# Render Deployment Checklist

## Pre-Deployment Setup

### 1. AWS S3 Setup
- [ ] Create AWS S3 bucket (e.g., `your-crm-files-bucket`)
- [ ] Create IAM user with S3 access
- [ ] Generate AWS Access Key ID and Secret Access Key
- [ ] Configure bucket permissions

### 2. Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `AWS_ACCESS_KEY_ID` - Your AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- [ ] `AWS_REGION` - AWS region (default: us-east-1)
- [ ] `AWS_S3_BUCKET_NAME` - Your S3 bucket name
- [ ] `SESSION_SECRET` - Random secure string
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Set to 5000

### 3. GitHub Repository
- [ ] Push code to GitHub repository
- [ ] Ensure all files are committed
- [ ] Repository is public or accessible to Render

## Render Platform Setup

### 1. Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Note connection details
- [ ] Set DATABASE_URL environment variable

### 2. Web Service Setup
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Environment: Node
  - Plan: Starter (or higher)

### 3. Environment Configuration
- [ ] Add all environment variables in Render dashboard
- [ ] Verify all variables are correctly set
- [ ] Test database connection

## Deployment Process

### 1. Initial Deploy
- [ ] Trigger first deployment
- [ ] Monitor build logs
- [ ] Wait for successful deployment
- [ ] Check health endpoint: `/health`

### 2. Database Migration
- [ ] Migrations run automatically via `postinstall` script
- [ ] Verify all tables are created
- [ ] Check admin user exists

### 3. Testing
- [ ] Access application URL
- [ ] Test login (admin/admin123)
- [ ] Create test customer
- [ ] Create test product
- [ ] Generate test invoice
- [ ] Test file uploads (if applicable)

## Post-Deployment

### 1. Security
- [ ] Change default admin password
- [ ] Create additional users if needed
- [ ] Test all functionality
- [ ] Monitor application logs

### 2. Performance
- [ ] Test application speed
- [ ] Monitor memory usage
- [ ] Check database performance
- [ ] Test concurrent users

### 3. Monitoring
- [ ] Set up health check monitoring
- [ ] Configure uptime alerts
- [ ] Monitor error logs
- [ ] Set up backup schedules

## Troubleshooting

### Common Issues:
1. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Review build logs

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Test database credentials

3. **Environment Variables**
   - Ensure all variables are set
   - Check for typos
   - Verify sensitive data

4. **Health Check Fails**
   - Check application startup
   - Verify port configuration
   - Review server logs

### Solutions:
- Check Render dashboard logs
- Verify environment variables
- Test database connectivity
- Review application configuration

## Success Criteria
- [ ] Application loads successfully
- [ ] Health check returns 200 OK
- [ ] Login works correctly
- [ ] All CRM features functional
- [ ] Database operations working
- [ ] File uploads working (if S3 configured)
- [ ] Settings persist correctly
- [ ] No console errors

## Support Resources
- Render Documentation: https://render.com/docs
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Application logs in Render dashboard