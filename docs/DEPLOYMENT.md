# MarketProbe 2.0 Deployment Guide

## 🏗️ Environment Strategy

### **Database Instances**

| Environment    | Branch         | Database                 | Purpose              |
| -------------- | -------------- | ------------------------ | -------------------- |
| **Production** | `main`         | PostgreSQL (Neon/Vercel) | Live data, customers |
| **Staging**    | `develop`, PRs | PostgreSQL (Neon Free)   | Test data, demos     |
| **Local**      | All branches   | Docker PostgreSQL        | Development          |

## 🚀 Quick Setup

### **1. Database Setup**

#### **Production Database (Neon - Recommended)**

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create project: `marketprobe-production`
3. Copy connection string:
   ```
   postgresql://user:pass@host/marketprobe_prod?sslmode=require
   ```

#### **Staging Database (Neon Free Tier)**

1. Create second project: `marketprobe-staging`
2. Copy connection string:
   ```
   postgresql://user:pass@host/marketprobe_staging?sslmode=require
   ```

### **2. Vercel Environment Variables**

#### **Production (Required)**

```bash
# Database
DATABASE_URL=postgresql://prod_connection_string

# Authentication (Production Clerk App)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Email (Optional)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=mg.yourdomain.com
```

#### **Staging/Preview (Optional but Recommended)**

```bash
# Database
DATABASE_URL_STAGING=postgresql://staging_connection_string

# Authentication (Development Clerk App)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_STAGING=pk_test_...
CLERK_SECRET_KEY_STAGING=sk_test_...

# Application
NEXT_PUBLIC_BASE_URL_STAGING=https://marketprobe-staging.vercel.app

# Email (Test configuration)
MAILGUN_API_KEY_STAGING=test_key
MAILGUN_DOMAIN_STAGING=sandbox123.mailgun.org
```

## 🔄 Deployment Workflows

### **Automated Migration System** 🚀

**Migrations now run automatically during the build process!**

- ✅ **No manual migration steps** required
- ✅ **Staging builds** automatically migrate staging database
- ✅ **Production builds** automatically migrate production database
- ✅ **Safe migration deployment** with proper rollback on failures

#### **Build Process**:

```bash
# Production/Staging Deployment
npm run build  # Includes:
# 1. prisma migrate deploy  (creates/updates tables)
# 2. prisma generate        (generates client)
# 3. next build            (builds application)

# CI/Testing Environment
npm run build:ci  # Includes:
# 1. prisma generate        (generates client only)
# 2. next build            (builds application)
# Note: No migrations - CI just tests code quality
```

#### **Migration Safety**:

- ✅ **Fail-fast**: Build fails if migration fails (prevents broken deployments)
- ✅ **Database locking**: Prisma handles concurrent migration safety
- ✅ **Rollback ready**: Failed deployments don't affect database state
- ✅ **Version tracking**: Migration history maintained in `_prisma_migrations` table

#### **What Happens During Migration**:

1. **Check migration status** - Compares local migrations vs database
2. **Apply pending migrations** - Runs any new migration files
3. **Generate Prisma client** - Creates typed database client
4. **Build application** - Compiles Next.js with database access
5. **Deploy** - Only if all previous steps succeed

### **Production Deployment**

- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Process**:
  1. Wait for CI to pass
  2. **Build application** (includes automatic production DB migration)
  3. Deploy to Vercel with `--prod` flag
  4. Run health check

### **Staging/Preview Deployment**

- **Trigger**: Push to `develop` or PR to `main`
- **Workflow**: `.github/workflows/preview-deploy.yml`
- **Process**:
  1. Wait for CI to pass
  2. **Build application** (includes automatic staging DB migration)
  3. Deploy to Vercel preview environment
  4. Comment PR with preview URL

## 📊 Staging Data Management

### **Setting Up Test Data**

After deploying to staging, you can populate it with test data:

```bash
# Using the admin dashboard (recommended)
1. Visit your staging deployment /admin
2. Create test projects manually
3. Generate analytics by visiting project pages

# Using the seed script (alternative)
NODE_ENV=staging DATABASE_URL=staging_url npm run setup:staging
```

### **Staging Data Includes**:

- ✅ 2 sample projects (AI tool + Eco packaging)
- ✅ 30 days of analytics data (~500 page views)
- ✅ Sample form submissions
- ✅ UTM tracking examples
- ✅ Multi-theme demonstrations

## 🔐 Authentication Setup

### **Production Clerk Setup**

1. Create production Clerk application
2. Configure production domain: `yourdomain.com`
3. Add production environment variables to Vercel
4. Set up webhooks if needed

### **Staging Clerk Setup**

1. Create development/test Clerk application
2. Configure staging domain: `*.vercel.app`
3. Add staging environment variables to Vercel
4. Test authentication flow

## 🌐 Custom Domain Setup

### **Production Domain**

1. **Vercel Configuration**:

   - Vercel Dashboard → Domains → Add `yourdomain.com`
   - Configure DNS records as instructed

2. **Database Configuration**:

   - Update `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
   - Configure Clerk for production domain

3. **Custom Domain Routing** (Optional):
   - Add domains to projects in admin dashboard
   - Configure DNS for custom domains
   - Test multi-domain routing

### **Domain Examples**:

```bash
# Main platform
https://yourdomain.com/admin          # Admin dashboard
https://yourdomain.com/p/project-slug # Project pages

# Custom domains (if configured)
https://customdomain.com              # Direct to specific project
https://another-domain.com            # Different project
```

## 📈 Monitoring & Maintenance

### **Health Checks**

- **Endpoint**: `/api/health`
- **Production**: Automated checks post-deployment
- **Staging**: Manual verification recommended

### **Database Maintenance**

#### **Production**:

- ✅ Regular backups (Neon handles automatically)
- ✅ Monitor query performance
- ✅ Scale resources as needed

#### **Staging**:

- 🔄 Reset data monthly (prevent clutter)
- 🧹 Clean test submissions regularly
- 📊 Regenerate analytics data as needed

### **Analytics Monitoring**

- **Production**: Real customer data
- **Staging**: Test data for dashboard development
- **Export**: Use admin dashboard export features

## 🚨 Troubleshooting

### **Common Issues**

#### **Database Connection**

```bash
# Verify connection
DATABASE_URL=your_url npx prisma db push
```

#### **Migrations**

```bash
# Check migration status (manual verification)
DATABASE_URL=your_url npx prisma migrate status

# Manual migration (only if automated process fails)
DATABASE_URL=your_url npx prisma migrate deploy

# Reset database (staging only!)
DATABASE_URL=staging_url npx prisma migrate reset --force
```

#### **Build Failures Related to Migrations**

- ✅ **Migration included in build** - No separate migration step needed
- ✅ **Check DATABASE_URL** - Ensure correct database connection string
- ✅ **Migration conflicts** - Resolve by creating new migration locally first
- ✅ **Database connectivity** - Verify database is accessible during build

#### **Environment Variables**

- Check Vercel Dashboard → Settings → Environment Variables
- Ensure variables match between workflows and Vercel
- Verify staging vs production variable names

## ✅ Deployment Checklist

### **Before First Production Deploy**:

- [ ] Production database created and accessible
- [ ] Production Clerk application configured
- [ ] All production environment variables set in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] Health check endpoint working

### **Before Each Release**:

- [ ] All tests passing locally
- [ ] Staging deployment tested and verified
- [ ] Database migrations reviewed
- [ ] Admin dashboard functionality tested
- [ ] Project creation and analytics working

### **Post-Deployment Verification**:

- [ ] Health check passes
- [ ] Admin authentication working
- [ ] Project pages loading correctly
- [ ] Analytics tracking functional
- [ ] Form submissions working
- [ ] Email notifications sending (if configured)

## 🎯 Cost Optimization

### **Database Costs**:

- **Neon Free Tier**: 0.5GB storage, 3GB transfer
- **Neon Pro**: $19/month (10GB storage, 100GB transfer)
- **Vercel Postgres**: $20/month after free compute hours

### **Recommendations**:

- Start with Neon free tier for production
- Use separate staging database on free tier
- Monitor usage and upgrade as needed
- Consider database connection pooling for scale
