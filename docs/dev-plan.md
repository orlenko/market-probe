# MarketProbe 2.0 Development Plan

## Project Evolution Overview

**From:** Single landing page template for market validation
**To:** Multi-project SaaS platform hosting multiple idea validation landing pages across domains

### Core Features:

- **Multi-project hosting:** Many landing pages for different startup/product ideas
- **Multi-domain routing:** Subpath (`/p/project-slug`) and custom domain support
- **Native form handling:** No external dependencies, all data stored in Postgres
- **First-party analytics:** Privacy-preserving analytics with conversion tracking
- **Admin dashboard:** Project management, analytics viewing, form submission management

## Tech Stack

- **Framework**: Next.js 14 with App Router and static export
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Email Notifications**: SendGrid/Mailgun/SMTP
- **Analytics**: Custom first-party system (inspired by Plausible/Umami)
- **Hosting**: Vercel

## Database Schema

### Core Tables:

- **Projects**: `id`, `slug`, `title`, `description`, `domain`, `status`, timestamps
- **PageConfigs**: `project_id`, `template_config` (JSON), `design_config` (JSON)
- **FormSubmissions**: `project_id`, `submitted_at`, `form_data` (JSON)
- **AnalyticsEvents**: `project_id`, `event_type`, `timestamp`, `referrer`, `user_agent`, `ip_hash`

## Project Structure

```
marketprobe-app/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard routes
│   │   ├── api/             # API endpoints
│   │   │   ├── form/[slug]/ # Form submission handling
│   │   │   ├── analytics/   # Analytics tracking
│   │   │   └── projects/    # Project CRUD operations
│   │   ├── p/[slug]/        # Dynamic project landing pages
│   │   └── [domain]/        # Custom domain routing (advanced)
│   ├── components/
│   │   ├── admin/           # Admin UI components
│   │   ├── landing/         # Landing page components
│   │   └── shared/          # Shared components
│   ├── lib/
│   │   ├── db.ts            # Database connection
│   │   ├── analytics.ts     # Analytics utilities (enhanced)
│   │   ├── email.ts         # Email notification system
│   │   └── domain-routing.ts # Domain routing logic
│   └── types/               # TypeScript definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
└── scripts/                 # Deployment and setup scripts
```

## Development Phases

## 🚀 CURRENT STATUS: Core Platform Complete!

**✅ COMPLETED PHASES:**

- ✅ **Phase 1**: Database Foundation (PostgreSQL + Prisma + Clerk Auth)
- ✅ **Phase 2**: API Layer & Form Handling (Native APIs replacing external services)
- ✅ **Phase 3**: Multi-Project Landing Pages (Dynamic routing + custom domains)
- ✅ **Phase 4**: Admin Dashboard (Complete project management + analytics dashboard)

**🎯 NEXT RECOMMENDED PHASES:**

- **Phase 5**: Testing & Migration (Comprehensive testing + performance optimization)
- **Phase 6**: Production Deployment (Production database + monitoring + CI/CD)
- **Alternative**: Focus on specific enhancements (A/B testing, form submissions export, etc.)

---

### Phase 1: Database Foundation ✅ (COMPLETED)

**Migration from external services to native data handling**

- [x] ~~Initialize Next.js project~~ (Existing)
- [x] ~~Set up Tailwind CSS~~ (Existing)
- [x] ~~Configure TypeScript~~ (Existing)
- [x] **NEW:** Set up PostgreSQL with Prisma ORM
  - [x] Create Prisma schema with multi-project data model
  - [x] Set up database connection and migrations
  - [x] Create seed data for development
- [x] **NEW:** Add Clerk authentication
  - [x] Configure Clerk for admin access
  - [x] Protect admin routes
- [x] **MIGRATE:** Convert existing analytics from Plausible-only to hybrid
  - [x] Enhance existing `analytics.ts` for first-party tracking
  - [x] Keep Plausible as optional external analytics
  - [x] Add database storage for analytics events

### Phase 2: API Layer & Form Handling ✅ (COMPLETED)

**Replace Formspree with native form handling**

- [x] **NEW:** Create API routes for form submissions
  - [x] `/api/form/[slug]` - Handle project-specific form submissions
  - [x] Store submissions in database instead of Formspree
  - [x] Implement email notifications for new submissions
- [x] **NEW:** Create analytics API endpoints
  - [x] `/api/analytics` - Track page views and events
  - [x] Implement privacy-preserving IP hashing
  - [x] Store events in database for dashboard viewing
- [x] **NEW:** Create project management APIs
  - [x] CRUD operations for projects
  - [x] Page configuration management
  - [x] Form submission retrieval
- [x] **MIGRATE:** Adapt existing EmailSignup component
  - [x] Update to use new native API instead of Formspree
  - [x] Maintain existing validation and UX
  - [x] Add project-aware form handling

### Phase 3: Multi-Project Landing Pages ✅ → ✅ (COMPLETED)

**Transform single page to dynamic template system**

- [x] **NEW:** Create dynamic project routing
  - [x] `/p/[slug]` - Project-specific landing pages
  - [x] Load project configuration from database
  - [x] Render landing page based on stored template config
- [x] **MIGRATE:** Convert existing landing page to template
  - [x] Extract current page content to configurable template
  - [x] Make hero, features, CTA sections data-driven
  - [x] Preserve existing responsive design and styling
- [ ] **ENHANCE:** Extend A/B testing for multi-project
  - [ ] Adapt existing A/B testing utilities
  - [ ] Make A/B variants project-specific
  - [ ] Track variant performance per project
- [x] **NEW:** Implement custom domain routing (basic)
  - [x] Domain-to-project mapping in database
  - [x] Routing logic for custom domains
  - [x] DNS configuration documentation

### Phase 4: Admin Dashboard ✅ → ✅ (COMPLETED)

**Complete admin interface for project management**

- [x] **NEW:** Admin layout and navigation
  - [x] Protected admin routes with Clerk
  - [x] Dashboard navigation and layout
  - [x] Responsive admin interface
- [x] **NEW:** Project management interface
  - [x] Project list view with metrics
  - [x] Create/edit project forms
  - [x] Project configuration interface (template & design config)
  - [x] Project status management (active/archived/graduated)
- [x] **NEW:** Analytics dashboard ✅ **COMPLETED**
  - [x] Page view and conversion metrics per project
  - [x] Traffic source analysis (referrers, UTM tracking)
  - [x] Time-based analytics charts (daily/weekly/monthly)
  - [x] Export capabilities for analytics data (CSV/JSON)
  - [x] Real-time charts with Recharts integration
  - [x] Professional responsive design
  - [x] Multi-project analytics support
- [x] **NEW:** Form submission management
  - [x] View submissions per project
  - [ ] Export submissions as CSV
  - [ ] Email notification configuration

### Phase 5: Testing & Migration 🔄 (Enhanced)

**Comprehensive testing for multi-project system**

- [ ] **MIGRATE:** Update existing tests for new architecture
  - [ ] Update EmailSignup component tests for new API
  - [ ] Test A/B testing utilities with multi-project support
- [ ] **NEW:** Database and API testing
  - [ ] Prisma model tests
  - [ ] API endpoint testing (form submissions, analytics)
  - [ ] Integration tests for project workflows
- [ ] **NEW:** Admin interface testing
  - [ ] Component tests for admin dashboard
  - [ ] E2E tests for project creation and management
- [ ] **ENHANCE:** Performance optimization
  - [ ] Database query optimization
  - [ ] Caching strategies for landing pages
  - [ ] Image and asset optimization
- [ ] **EXISTING:** Cross-browser and accessibility testing
  - [ ] Multi-device testing for both landing pages and admin
  - [ ] Accessibility compliance (WCAG guidelines)

### Phase 6: Deployment & Production 🔄 (Enhanced)

**Production deployment with database and multi-tenancy**

- [ ] **NEW:** Database deployment setup
  - [ ] Configure production PostgreSQL (Vercel Postgres or external)
  - [ ] Set up database migrations for production
  - [ ] Configure connection pooling and security
- [ ] **NEW:** Environment configuration
  - [ ] Production environment variables
  - [ ] Clerk production configuration
  - [ ] Email service configuration (SendGrid/Mailgun)
- [ ] **ENHANCE:** Deployment pipeline
  - [ ] Update existing Vercel deployment for database integration
  - [ ] Add database migration step to CI/CD
  - [ ] Configure custom domain routing in Vercel
- [ ] **NEW:** Monitoring and observability
  - [ ] Error tracking and logging
  - [ ] Performance monitoring

## Configuration Requirements

### Environment Variables:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- [ ] `CLERK_SECRET_KEY` - Clerk server-side key
- [ ] `EMAIL_SERVICE_API_KEY` - SendGrid/Mailgun API key
- [ ] `PLAUSIBLE_DOMAIN` - Optional external analytics
- [ ] `NEXT_PUBLIC_BASE_URL` - Base URL for routing

### Migration Strategy:

1. **Parallel development**: Build new features alongside existing ones
2. **Feature flags**: Toggle between old and new systems during transition
3. **Data migration**: Scripts to import existing Formspree data (if applicable)
4. **Gradual rollout**: Start with admin features, then migrate landing pages

## Future Enhancements (Post-MVP)

- Advanced custom domain automation with DNS API integration
- Team collaboration features (multi-user access)
- Advanced A/B testing with statistical significance tracking
- Email automation workflows for lead nurturing
- API endpoints for programmatic project creation
- Public project directory (`/explore` page)
- Template marketplace with multiple landing page designs
- Integration with popular email marketing platforms
- Webhook support for external integrations
- Advanced analytics with funnel tracking

## Success Metrics

- **Technical**: Successful migration from external services to native platform
- **Functional**: Ability to create and manage multiple projects with independent analytics
- **Performance**: Sub-2s page load times for landing pages
- **Scalability**: Support for 100+ concurrent projects
- **Usability**: Admin dashboard completion of project setup in under 5 minutes
