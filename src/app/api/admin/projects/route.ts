import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, domain, status } = body;

    // Validation
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    // Check if domain is already taken (if provided)
    if (domain) {
      const existingDomain = await prisma.project.findUnique({
        where: { domain },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: 'A project with this domain already exists' },
          { status: 400 }
        );
      }

      // Validate domain format
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
        return NextResponse.json(
          { error: 'Please enter a valid domain (e.g., example.com)' },
          { status: 400 }
        );
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description: description || null,
        domain: domain || null,
        status: status || 'DRAFT',
      },
    });

    // Create default page config for the project
    await prisma.pageConfig.create({
      data: {
        projectId: project.id,
        templateConfig: {
          hero: {
            headline: title,
            subheadline: description || `Validate your ${title} idea with real users`,
            ctaText: 'Join Waitlist',
          },
          features: [
            {
              title: 'Feature 1',
              description: 'Describe your first key feature',
            },
            {
              title: 'Feature 2',
              description: 'Describe your second key feature',
            },
            {
              title: 'Feature 3',
              description: 'Describe your third key feature',
            },
          ],
          form: {
            fields: ['email'],
            submitText: 'Get Early Access',
            successMessage: "Thanks! We'll be in touch soon.",
          },
        },
        designConfig: {
          theme: 'default',
          colors: {
            primary: '#3B82F6',
            secondary: '#1F2937',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
        },
        isActive: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
