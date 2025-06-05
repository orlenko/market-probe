# MarketProbe 2.0 Database Setup Guide

## Overview

MarketProbe 2.0 uses PostgreSQL with Prisma ORM for data persistence. This guide covers setup for local development, staging, and production environments.

## Quick Start (Local Development)

### 1. Start Local Database

```bash
# Start PostgreSQL and Redis with Docker
npm run docker:up

# Check container status
docker ps
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your local configuration
# For local dev, the default DATABASE_URL should work:
# DATABASE_URL="postgresql://dev:dev@localhost:5432/marketprobe_dev"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio
# Visit http://localhost:5555

# Or check via Adminer
# Visit http://localhost:8080
# Server: postgres, Username: dev, Password: dev, Database: marketprobe_dev
```

## Database Schema

### Core Tables

#### `projects`

- Stores individual landing page projects
- Each project has a unique slug and optional custom domain
- Status tracking (ACTIVE, ARCHIVED, GRADUATED)

#### `page_configs`

- Landing page content and design configuration
- JSON fields for flexible template and design settings
- Supports A/B testing with `isActive` flag

#### `form_submissions`

- Waitlist signups and contact form submissions
- Captures UTM parameters for attribution
- Privacy-preserving IP hashing

#### `analytics_events`

- First-party analytics tracking
- Page views, form submissions, and user interactions
- Privacy-first approach with IP hashing

## Environment Configurations

### Local Development

```bash
DATABASE_URL="postgresql://dev:dev@localhost:5432/marketprobe_dev"
REDIS_URL="redis://localhost:6379"
```

### Staging (Neon)

```bash
DATABASE_URL="postgresql://username:password@staging-host.neon.tech/marketprobe_staging"
```

### Production (Neon)

```bash
DATABASE_URL="postgresql://username:password@prod-host.neon.tech/marketprobe_prod"
```

## Useful Commands

### Database Management

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Deploy migrations to production (no prompts)
npm run db:deploy

# Reset database (WARNING: deletes all data)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Open database GUI
npm run db:studio
```

### Docker Management

```bash
# Start containers
npm run docker:up

# Stop containers
npm run docker:down

# View logs
npm run docker:logs

# Complete reset (deletes volumes)
npm run setup:clean
```

### Quick Setup Commands

```bash
# Full local setup from scratch
npm run setup:local

# Clean setup (removes all data)
npm run setup:clean
```

## Production Deployment

### Neon Setup

1. Create Neon project at https://neon.tech
2. Create staging and production databases
3. Copy connection strings to environment variables
4. Run migrations: `npm run db:deploy`

### Environment Variables

Required for production:

```bash
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_..."
MAILGUN_API_KEY="..."
```

## Troubleshooting

### Connection Issues

```bash
# Check if database is running
docker ps | grep postgres

# Check connection
npx prisma db pull

# View container logs
docker logs marketprobe-postgres
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Force reset if needed (WARNING: deletes data)
npm run db:reset
```

### Schema Issues

```bash
# Regenerate client after schema changes
npm run db:generate

# Create migration for schema changes
npm run db:migrate
```

## Sample Data

The seed script creates:

- 2 sample projects with different themes
- Form submissions with UTM tracking
- Analytics events over the past 7 days
- Page configurations with realistic content

Access sample projects:

- AI Writing Assistant: http://localhost:3000/p/ai-writing-assistant
- EcoBox Packaging: http://localhost:3000/p/eco-friendly-packaging

## Security Notes

- IP addresses are hashed for privacy
- Database credentials should never be committed
- Use environment variables for all sensitive data
- Regular backups recommended for production

## Performance Considerations

- Database indexes on frequently queried columns
- Connection pooling in production
- Analytics data archival strategy (implement later)
- Consider read replicas for high traffic
