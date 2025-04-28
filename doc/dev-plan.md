# Market-Probe Development Plan

## Project Overview
A reusable landing page template for market validation of product ideas with:
- Single page promoting a potential product
- Email capture for waiting list sign-ups
- Analytics integration
- A/B testing capability

## Tech Stack
- **Framework**: Next.js with static export
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Email Handling**: Formspree
- **Analytics**: Plausible
- **Hosting**: Vercel

## Project Structure
- `/app`: Next.js app router
- `/components`: Reusable UI components
- `/public`: Static assets
- `/styles`: Global styles
- `/lib`: Utility functions and helpers
- `/types`: TypeScript type definitions

## Development Phases

### Phase 1: Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Set up Tailwind CSS
- [x] Configure project structure
- [x] Set up linting and formatting
- [x] Create basic README with setup instructions
- [x] Configure static export
- [x] Set up Git workflow
      - [x] GitHub Actions for CI/CD (lint, build, test)
      - [x] Deployment workflow to Vercel
      - [x] Contributing guidelines

### Phase 2: Core Components
- [x] Create responsive layout component
  - [x] Header section
  - [x] Hero section
  - [x] Features/Benefits section
  - [x] Email sign-up section
  - [x] Footer
- [x] Implement email capture form with Formspree
  - [x] Form validation
  - [x] Success/error states
  - [x] Anti-spam measures
- [x] Add SEO metadata
  - [x] Basic meta tags
  - [x] Open Graph tags for social media
  - [x] Twitter card metadata

### Phase 3: Analytics & Testing
- [x] Integrate Plausible Analytics
- [x] Set up A/B testing framework
  - [x] Implement variant display logic
  - [x] Set up tracking for different variants
  - [x] Create configuration for easy variant setup
- [x] Set up testing environment
  - [x] Configure Jest with Next.js
  - [x] Write tests for components
  - [x] Set up CI test workflow

### Phase 4: Styling & Responsiveness
- [x] Implement base styling with Tailwind
- [x] Create responsive designs for:
  - [x] Desktop view
  - [x] Tablet view
  - [x] Mobile view
- [x] Ensure consistent spacing and typography
- [x] Add placeholder graphics/illustrations
- [x] Verify successful build process

### Phase 5: Testing & Optimization
- [ ] Cross-browser testing
- [ ] Performance optimization
  - [ ] Image optimization
  - [ ] Font optimization
  - [ ] Minimize JavaScript
- [ ] Accessibility checks
- [ ] SEO optimization

### Phase 6: Deployment & Documentation
- [ ] Set up Vercel deployment
- [ ] Configure custom domain (if applicable)
- [ ] Create comprehensive documentation
  - [ ] Setup and deployment instructions
  - [ ] Customization guide
  - [ ] A/B testing instructions
- [ ] Final QA and launch

## Configuration Requirements
- Environment variables for:
  - [x] Formspree endpoint
  - [x] Plausible domain/settings
  - [x] A/B testing parameters

## Future Enhancements (Post-MVP)
- Social sharing capabilities
- Multiple templates/themes
- Email automation integration
- Internationalization support
- Advanced A/B testing metrics dashboard
