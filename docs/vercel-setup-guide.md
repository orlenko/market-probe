# Vercel Deployment Setup Guide

## 🎯 **Current Status**
✅ **GitHub Actions CI**: Working perfectly (37s build time)
❌ **Vercel Deployment**: Missing configuration secrets

## 🔧 **Required GitHub Secrets**

To complete the preview deployment, add these secrets to your GitHub repository:

### **Step 1: Get Vercel Information**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find Your Project**: Look for `market-probe` project
3. **Get Vercel Token**:
   - Go to https://vercel.com/account/tokens
   - Create new token: "GitHub Actions Deploy"
   - Copy the token value

4. **Get Project Info**:
   - In your project settings, find:
   - **Project ID**: In project settings → General
   - **Org ID**: In your account settings

### **Step 2: Add GitHub Secrets**

Go to: `https://github.com/orlenko/market-probe/settings/secrets/actions`

Add these secrets:

```bash
# Required for Vercel Deployment
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

### **Step 3: Test Preview Deployment**

After adding secrets, test by:

```bash
# Push any small change to trigger deployment
git commit --allow-empty -m "test: trigger preview deployment"
git push origin multi-domain
```

## 🎯 **Expected Results After Configuration**

```bash
✅ GitHub Actions: Build completes (~37s)
✅ Vercel Deploy: Creates preview URL (~2-4 minutes)
✅ Preview URL: App accessible and functional
✅ Total Pipeline: ~5 minutes from push to live preview
```

## 🔍 **Verification Checklist**

After adding secrets:
- [ ] Push triggers both GitHub Actions and Vercel deployment
- [ ] No "vercel-token" error in GitHub Actions logs
- [ ] Vercel creates preview deployment successfully
- [ ] Preview URL is accessible
- [ ] Basic app functionality works (landing page loads)

## 📊 **Performance Baseline (So Far)**

From current testing:
```bash
GitHub Actions Build Time: 37 seconds
- npm ci: 18s (with cache)
- Prisma generate: 200ms
- Next.js build: 16s
- Bundle size: 107kB (optimized)

Vercel Deploy Time: TBD (after configuration)
Total Pipeline Time: TBD
```

## 🚀 **After Successful Setup**

Once preview deployments work, we'll move to **Phase 2: Optimization Audit**:

1. **Measure full pipeline performance**
2. **Identify duplication between GitHub Actions and Vercel**
3. **Implement optimizations for 30% faster deployments**
4. **Document optimized CI/CD architecture**

## ⚠️ **Common Issues**

**If Vercel deployment still fails:**
- Verify token has correct permissions
- Check project ID matches exactly
- Ensure org ID is correct
- Try regenerating Vercel token

**If app doesn't load:**
- Check Vercel function logs
- Verify environment variables in Vercel dashboard
- Check for build errors in Vercel deployment logs
