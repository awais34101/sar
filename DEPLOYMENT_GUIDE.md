# CRM Business System - Deployment Guide

## Overview
This guide will help you deploy your CRM Business System to Render with AWS S3 integration.

## Prerequisites
- Render account (free tier available)
- AWS account with S3 access
- GitHub repository for your code

## Step 1: AWS S3 Setup

### 1.1 Create S3 Bucket
1. Login to AWS Console
2. Navigate to S3 service
3. Create a new bucket:
   - Bucket name: `your-crm-files-bucket` (must be globally unique)
   - Region: `us-east-1` (or your preferred region)
   - Block all public access: Keep enabled for security
   - Versioning: Optional
   - Encryption: Enable with Amazon S3 key (SSE-S3)

### 1.2 Create IAM User for S3 Access
1. Navigate to IAM service
2. Create new user: `crm-s3-user`
3. Attach policy: `AmazonS3FullAccess` (or create custom policy for specific bucket)
4. Generate Access Keys:
   - Access Key ID: Save this
   - Secret Access Key: Save this (shown only once)

### 1.3 S3 Bucket Policy (Optional - for direct access)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CRMAppAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/crm-s3-user"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-crm-files-bucket/*"
        }
    ]
}
```

## Step 2: PostgreSQL Database Setup

### 2.1 On Render (Recommended)
1. Login to Render dashboard
2. Create new PostgreSQL database:
   - Name: `crm-business-db`
   - Plan: Free tier (or paid for production)
   - Region: Same as your web service
3. Save the connection details provided

### 2.2 Alternative: External Database
You can also use:
- AWS RDS PostgreSQL
- Google Cloud SQL
- Azure Database for PostgreSQL
- Any PostgreSQL-compatible database

## Step 3: Environment Variables Setup

Create these environment variables in Render:

### Required Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-crm-files-bucket
SESSION_SECRET=your_random_session_secret_key
NODE_ENV=production
PORT=5000
```

## Step 4: Deploy to Render

### 4.1 Connect GitHub Repository
1. Push your code to GitHub
2. Login to Render dashboard
3. Click "New" > "Web Service"
4. Connect your GitHub repository

### 4.2 Configure Web Service
- **Name**: `crm-business-system`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free tier (or paid for production)

### 4.3 Set Environment Variables
Add all the environment variables from Step 3 in the Render dashboard.

### 4.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your app will be available at: `https://your-app-name.onrender.com`

## Step 5: Database Migration

The system will automatically run database migrations on startup using the `postinstall` script.

## Step 6: Initial Setup

### 6.1 Access Your Application
1. Go to your Render app URL
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

### 6.2 Change Default Password
1. Go to Settings page
2. Create a new admin user
3. Delete the default admin user (recommended for security)

## Step 7: Testing

### 7.1 Health Check
Visit: `https://your-app-name.onrender.com/health`
Should return: `{"status": "healthy", "timestamp": "...", "uptime": "..."}`

### 7.2 Application Test
1. Test login functionality
2. Create a customer
3. Add a product
4. Create an invoice
5. Check dashboard analytics

## Step 8: Security Considerations

### 8.1 Production Security
- [ ] Change default admin password
- [ ] Enable HTTPS (automatic on Render)
- [ ] Configure S3 bucket policies properly
- [ ] Use strong session secrets
- [ ] Enable database connection encryption

### 8.2 Monitoring
- [ ] Set up Render health checks
- [ ] Monitor application logs
- [ ] Set up alerts for downtime
- [ ] Monitor database performance

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

2. **S3 Upload Failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Confirm bucket exists and is accessible

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs for specific errors

4. **Performance Issues**
   - Upgrade to paid Render plan
   - Optimize database queries
   - Consider CDN for static assets

## Support

For technical support:
1. Check Render documentation
2. Review AWS S3 documentation
3. Check application logs in Render dashboard
4. Contact your development team

## Backup Strategy

### Database Backup
- Render PostgreSQL includes automatic backups
- For custom databases, set up regular backups
- Test restore procedures regularly

### File Backup
- S3 provides built-in durability
- Consider cross-region replication for critical data
- Implement versioning for important files

---

**Note**: This deployment guide assumes you're using the production-ready configuration files included in your project.