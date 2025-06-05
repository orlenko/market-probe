import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Validation schemas
const createProjectSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  domain: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Invalid domain format')
    .optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'GRADUATED']).default('ACTIVE'),
  templateConfig: z.object({
    headline: z.string().min(1, 'Headline is required').max(200),
    subheadline: z.string().max(500),
    ctaText: z.string().min(1, 'CTA text is required').max(50),
    features: z
      .array(
        z.object({
          title: z.string().max(100),
          description: z.string().max(300),
          icon: z.string().max(50).optional(),
        })
      )
      .max(10),
    socialProof: z
      .object({
        testimonials: z
          .array(
            z.object({
              name: z.string().max(100),
              company: z.string().max(100).optional(),
              text: z.string().max(500),
              avatar: z.string().url().optional(),
            })
          )
          .max(5)
          .optional(),
        metrics: z.record(z.string().max(50)).optional(),
      })
      .optional(),
    additionalSections: z
      .object({
        about: z.string().max(1000).optional(),
        pricing: z.any().optional(),
        faq: z
          .array(
            z.object({
              question: z.string().max(200),
              answer: z.string().max(1000),
            })
          )
          .max(10)
          .optional(),
      })
      .optional(),
  }),
  designConfig: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    secondaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
      .optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    fontFamily: z.string().max(50),
    theme: z.enum(['modern', 'minimal', 'bold', 'eco', 'tech', 'creative']),
    customCSS: z.string().max(5000).optional(),
    logo: z
      .object({
        url: z.string().url(),
        alt: z.string().max(100),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
      })
      .optional(),
    hero: z
      .object({
        backgroundImage: z.string().url().optional(),
        backgroundVideo: z.string().url().optional(),
        style: z.enum(['centered', 'split', 'fullscreen']),
      })
      .optional(),
  }),
});

const updateProjectSchema = createProjectSchema.partial().omit({ slug: true });

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where = status ? { status: status as any } : {};

    // Get projects with counts
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          pageConfigs: {
            where: { isActive: true },
            take: 1,
          },
          _count: {
            select: {
              formSubmissions: true,
              analyticsEvents: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 }
      );
    }

    // Check if domain already exists (if provided)
    if (validatedData.domain) {
      const existingDomain = await prisma.project.findUnique({
        where: { domain: validatedData.domain },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: 'A project with this domain already exists' },
          { status: 409 }
        );
      }
    }

    // Create project with page config
    const project = await prisma.project.create({
      data: {
        slug: validatedData.slug,
        title: validatedData.title,
        description: validatedData.description,
        domain: validatedData.domain,
        status: validatedData.status,
        pageConfigs: {
          create: {
            templateConfig: validatedData.templateConfig,
            designConfig: validatedData.designConfig,
            isActive: true,
          },
        },
      },
      include: {
        pageConfigs: true,
        _count: {
          select: {
            formSubmissions: true,
            analyticsEvents: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce(
        (acc, err) => {
          const field = err.path.join('.');
          acc[field] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );

      return NextResponse.json(
        {
          error: 'Validation failed',
          fields: fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Project with this slug or domain already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
