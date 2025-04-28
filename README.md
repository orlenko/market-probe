# Market-Probe

A reusable landing page template for market validation of product ideas. Quickly create and deploy product validation pages with email capture, analytics, and A/B testing capabilities.

## Features

- 📱 Responsive single-page design
- ✉️ Email capture for waiting list sign-ups
- 📊 Built-in analytics tracking
- 🔄 A/B testing capability
- 🚀 Static export for fast hosting
- 🎨 Customizable UI components

## Tech Stack

- **Framework**: Next.js with static export
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Email Handling**: Formspree
- **Analytics**: Plausible
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/market-probe.git
   cd market-probe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_FORMSPREE_ENDPOINT=your-formspree-id
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain
```

## Deployment

This project is configured for easy deployment to Vercel:

```bash
npm run build
```

The static export will be generated in the `out` directory.

## Customization

Refer to `doc/dev-plan.md` for customization guidelines and project structure.

## License

[MIT](LICENSE)
