# MarketProbe 2.0 Development Guide

## 🎨 Auto-Formatting System

### **Intelligent Code Formatting**

MarketProbe uses an **automated formatting system** that maintains consistent code style without blocking development:

#### **How It Works:**

- ✅ **Push unformatted code** to any branch (except `main`)
- ✅ **Auto-format workflow** runs automatically
- ✅ **Formatted code** is committed back to your branch
- ✅ **PR comments** notify you when formatting is applied
- ✅ **Continue developing** without manual formatting steps

#### **Workflow Behavior:**

| Branch Type          | Auto-Format | Behavior                    |
| -------------------- | ----------- | --------------------------- |
| **Feature branches** | ✅ Yes      | Auto-commits formatted code |
| **`develop` branch** | ✅ Yes      | Auto-commits formatted code |
| **`main` branch**    | ❌ No       | Formatting must be clean    |
| **PR from forks**    | ❌ No       | Security restriction        |

#### **What Gets Formatted:**

- `.js`, `.jsx`, `.ts`, `.tsx` files
- `.json` configuration files
- `.md` documentation files
- `.css` stylesheets

### **Local Development Commands**

```bash
# Check if formatting is needed
npm run format:check

# Auto-fix formatting issues
npm run format:fix
# or
npm run format

# Pre-commit formatting (recommended)
npm run format && git add . && git commit -m "Your message"
```

### **Developer Experience Benefits**

#### **Before Auto-Formatting:**

1. Write code
2. Push to branch
3. ❌ CI fails on formatting
4. Run `npm run format` locally
5. Commit and push again
6. Wait for CI to pass

#### **With Auto-Formatting:**

1. Write code
2. Push to branch
3. ✅ Auto-format runs and commits back
4. Continue developing immediately

## 🔄 Development Workflow

### **Feature Development:**

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Develop (don't worry about formatting)
# Write code, make changes...

# 3. Push to branch
git push origin feature/amazing-feature

# 4. Auto-formatting happens automatically
# - CI runs auto-format workflow
# - Formatted code is committed back
# - You're notified via GitHub

# 5. Create PR when ready
# - All formatting is already handled
# - CI focuses on tests and logic
# - Faster feedback loop
```

### **Pull Request Workflow:**

1. **Open PR** → Auto-format runs on PR changes
2. **Code review** → Focus on logic, not style
3. **Merge to main** → Clean, formatted code

## 🛠️ Development Environment

### **Required Setup:**

```bash
# Install dependencies
npm ci

# Set up local database
npm run setup:local

# Start development server
npm run dev
```

### **Development Database:**

- **Local**: Docker PostgreSQL (isolated)
- **Staging**: Neon free tier (shared testing)
- **Production**: Neon/Vercel Postgres (live data)

### **Automated Migrations:**

- ✅ **No manual migration steps**
- ✅ **Database schema updates automatically**
- ✅ **Works across all environments**

## 🧪 Testing

### **Test Commands:**

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI tests (coverage + no watch)
npm run test:ci
```

### **Test Strategy:**

- **Unit tests**: Component and utility functions
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Critical user flows (future)

## 📝 Code Style Guidelines

### **Automated via Prettier:**

- 2-space indentation
- Single quotes for strings
- Trailing commas where valid
- Semicolons required
- Line length: 80 characters (flexible)

### **TypeScript Standards:**

- Strict mode enabled
- Explicit return types for functions
- Interface over type aliases
- Descriptive variable names

### **Component Guidelines:**

```tsx
// ✅ Good: Clear, typed component
interface Props {
  title: string;
  onSubmit: (data: FormData) => Promise<void>;
}

export function MyComponent({ title, onSubmit }: Props) {
  return <div>{title}</div>;
}

// ❌ Avoid: Unclear props, any types
export function MyComponent(props: any) {
  return <div>{props.title}</div>;
}
```

## 🔧 Productivity Tips

### **VSCode Integration:**

```json
// .vscode/settings.json (recommended)
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### **Git Hooks (Optional):**

```bash
# Pre-commit formatting
echo "npm run format:fix" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### **Quick Commands:**

```bash
# Format + commit in one step
npm run format && git add . && git commit -m "feat: add new feature"

# Check everything before push
npm run quality  # Runs: type-check, lint, format:check, test

# Build for production (with migrations)
npm run build

# Build for CI/testing (no migrations)
npm run build:ci

# Reset local development database
npm run setup:clean
```

## 🚀 Performance & Optimization

### **Build Performance:**

- ✅ **Prisma generate** cached in CI
- ✅ **Node modules** cached across builds
- ✅ **Incremental TypeScript** compilation

### **Development Performance:**

- ✅ **Hot reload** with Next.js dev server
- ✅ **Fast refresh** for React components
- ✅ **TypeScript** incremental compilation

## 🔍 Debugging

### **Common Issues:**

#### **Formatting Conflicts:**

```bash
# If auto-format didn't work as expected
git pull origin your-branch  # Get latest auto-formatted code
npm run format:check         # Verify formatting status
```

#### **Database Issues:**

```bash
# Reset local database
npm run setup:clean

# Check migration status
npx prisma migrate status

# Generate Prisma client
npm run db:generate
```

#### **TypeScript Errors:**

```bash
# Check types without emitting
npm run type-check

# Clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo
```

## 📚 Additional Resources

- **Prettier Configuration**: `.prettierrc`
- **ESLint Rules**: `.eslintrc.json`
- **TypeScript Config**: `tsconfig.json`
- **Database Schema**: `prisma/schema.prisma`
- **Deployment Guide**: `docs/DEPLOYMENT.md`

## 🔄 CI/CD Architecture Options

### **Current: GitHub Actions + Vercel (Recommended)**

```bash
# Professional CI/CD Pipeline
GitHub Actions: Quality Gates → Vercel: Deployment
- TypeScript validation
- ESLint + Prettier
- Unit tests with coverage
- Security vulnerability scanning
- Database migration validation
- Build verification
→ Automatic deployment to Vercel
```

**Benefits for MarketProbe:**

- ✅ Comprehensive quality assurance before deployment
- ✅ Security scanning for business application
- ✅ Database migration validation
- ✅ Team collaboration with PR status checks
- ✅ Parallel test execution for faster feedback
- ✅ Industry-standard DevOps practices

### **Alternative: Vercel-Only CI**

```json
// vercel.json - Simplified approach
{
  "buildCommand": "npm run quality && npm run build",
  "installCommand": "npm ci"
}
```

**When to Consider:**

- Solo developer projects
- Simple applications without databases
- Rapid prototyping needs
- Cost-sensitive projects (GitHub Actions limits)

**Trade-offs:**

- ❌ Less comprehensive testing
- ❌ No parallel job execution
- ❌ Limited security scanning
- ❌ Weaker quality gates

### **Hybrid Approach: Essential CI**

If you want to simplify while keeping quality gates:

```yaml
# Simplified GitHub Actions
jobs:
  essential-checks:
    steps:
      - TypeScript + ESLint + Tests (combined)
      - Security scan
      - Build verification
→ Deploy to Vercel
```

**Best of Both Worlds:**

- ✅ Essential quality gates maintained
- ✅ Reduced complexity vs full pipeline
- ✅ Faster than comprehensive CI
- ✅ Still prevents bad deployments

### **Migration Strategy**

If you want to try Vercel-only:

1. **Test Phase**: Temporarily disable GitHub Actions
2. **Update vercel.json**: Add comprehensive build command
3. **Monitor**: Watch for any quality issues that slip through
4. **Decide**: Keep simplified or return to comprehensive CI

```json
// vercel.json for testing Vercel-only approach
{
  "buildCommand": "npm run type-check && npm run lint && npm run test:ci && npm run build",
  "installCommand": "npm ci"
}
```
