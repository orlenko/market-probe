import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { slug: 'ai-writing-assistant' },
    update: {},
    create: {
      slug: 'ai-writing-assistant',
      title: 'AI Writing Assistant',
      description:
        'A smart writing companion that helps you create better content faster using advanced AI technology.',
      status: 'ACTIVE',
      pageConfigs: {
        create: {
          templateConfig: {
            headline: 'Write Better Content 10x Faster',
            subheadline:
              'Meet your AI writing assistant that helps entrepreneurs, marketers, and content creators produce high-quality content in minutes, not hours.',
            ctaText: 'Join the Waitlist',
            features: [
              {
                title: 'AI-Powered Writing',
                description:
                  'Generate blog posts, emails, and social media content with advanced AI',
              },
              {
                title: 'Brand Voice Learning',
                description: 'The AI learns your unique writing style and maintains consistency',
              },
              {
                title: 'SEO Optimization',
                description: 'Built-in SEO suggestions to help your content rank higher',
              },
            ],
            socialProof: {
              testimonials: [],
              metrics: {
                users: '500+',
                contentGenerated: '10,000+',
                timeSaved: '50 hours',
              },
            },
          },
          designConfig: {
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Inter',
            theme: 'modern',
          },
        },
      },
    },
    include: { pageConfigs: true },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: 'eco-friendly-packaging' },
    update: {},
    create: {
      slug: 'eco-friendly-packaging',
      title: 'EcoBox - Sustainable Packaging',
      description:
        'Biodegradable packaging solutions for e-commerce businesses that care about the environment.',
      domain: 'ecobox-demo.com',
      status: 'ACTIVE',
      pageConfigs: {
        create: {
          templateConfig: {
            headline: "Packaging That Doesn't Cost the Earth",
            subheadline:
              'Switch to 100% biodegradable packaging for your e-commerce business. Same protection, zero environmental impact.',
            ctaText: 'Get Free Samples',
            features: [
              {
                title: '100% Biodegradable',
                description: 'Breaks down completely in 90 days, leaving no harmful residue',
              },
              {
                title: 'Custom Branding',
                description: 'Beautiful custom printing that showcases your brand values',
              },
              {
                title: 'Cost Competitive',
                description: 'Pricing comparable to traditional packaging with bulk discounts',
              },
            ],
            socialProof: {
              testimonials: [
                {
                  name: 'Sarah Chen',
                  company: 'GreenStore Co.',
                  text: "Our customers love the sustainable packaging. It's a key part of our brand now.",
                },
              ],
              metrics: {
                businesses: '200+',
                packagesShipped: '1M+',
                co2Saved: '50 tons',
              },
            },
          },
          designConfig: {
            primaryColor: '#059669',
            secondaryColor: '#10b981',
            backgroundColor: '#f0fdf4',
            textColor: '#064e3b',
            fontFamily: 'Inter',
            theme: 'eco',
          },
        },
      },
    },
    include: { pageConfigs: true },
  });

  // Create sample form submissions
  await prisma.formSubmission.createMany({
    data: [
      {
        projectId: project1.id,
        formData: {
          email: 'john@example.com',
          name: 'John Doe',
          company: 'StartupCorp',
          message: 'Very interested in the AI writing features!',
        },
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        utmSource: 'twitter',
        utmMedium: 'social',
      },
      {
        projectId: project1.id,
        formData: {
          email: 'sarah@agency.com',
          name: 'Sarah Wilson',
          company: 'Digital Agency Pro',
        },
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'ai-writing-launch',
      },
      {
        projectId: project2.id,
        formData: {
          email: 'mike@ecommerce.store',
          name: 'Mike Johnson',
          company: 'EcoShop',
          message: 'Need sustainable packaging for 1000+ monthly orders',
        },
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        utmSource: 'linkedin',
        utmMedium: 'social',
      },
    ],
  });

  // Create sample analytics events
  const analyticsEvents = [];
  const now = new Date();

  // Generate page views for the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);

    // Random number of page views per day (5-25)
    const pageViewsCount = Math.floor(Math.random() * 20) + 5;

    for (let i = 0; i < pageViewsCount; i++) {
      analyticsEvents.push({
        projectId: Math.random() > 0.6 ? project1.id : project2.id,
        eventType: 'PAGE_VIEW' as const,
        timestamp: new Date(dayDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        referrer:
          Math.random() > 0.7
            ? 'https://twitter.com'
            : Math.random() > 0.5
              ? 'https://google.com'
              : null,
        pathname: '/p/' + (Math.random() > 0.6 ? 'ai-writing-assistant' : 'eco-friendly-packaging'),
        utmSource: Math.random() > 0.8 ? 'twitter' : Math.random() > 0.6 ? 'google' : null,
        utmMedium: Math.random() > 0.8 ? 'social' : Math.random() > 0.6 ? 'cpc' : null,
      });
    }
  }

  await prisma.analyticsEvent.createMany({
    data: analyticsEvents,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${analyticsEvents.length} analytics events`);
  console.log('🚀 Projects:');
  console.log(`   - AI Writing Assistant: /p/ai-writing-assistant`);
  console.log(`   - EcoBox Packaging: /p/eco-friendly-packaging (domain: ecobox-demo.com)`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
