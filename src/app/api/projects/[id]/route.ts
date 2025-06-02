import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Update schema (same as create but partial and without slug)
const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  domain: z.string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Invalid domain format')
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'GRADUATED']).optional(),
  templateConfig: z.object({
    headline: z.string().min(1, 'Headline is required').max(200),
    subheadline: z.string().max(500),
    ctaText: z.string().min(1, 'CTA text is required').max(50),
    features: z.array(z.object({
      title: z.string().max(100),
      description: z.string().max(300),
      icon: z.string().max(50).optional(),
    })).max(10),
    socialProof: z.object({
      testimonials: z.array(z.object({
        name: z.string().max(100),
        company: z.string().max(100).optional(),
        text: z.string().max(500),
        avatar: z.string().url().optional(),
      })).max(5).optional(),
      metrics: z.record(z.string().max(50)).optional(),
    }).optional(),
    additionalSections: z.object({
      about: z.string().max(1000).optional(),
      pricing: z.any().optional(),
      faq: z.array(z.object({
        question: z.string().max(200),
        answer: z.string().max(1000),
      })).max(10).optional(),
    }).optional(),
  }).optional(),
  designConfig: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    fontFamily: z.string().max(50),
    theme: z.enum(['modern', 'minimal', 'bold', 'eco', 'tech', 'creative']),
    customCSS: z.string().max(5000).optional(),
    logo: z.object({
      url: z.string().url(),
      alt: z.string().max(100),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    }).optional(),
    hero: z.object({
      backgroundImage: z.string().url().optional(),
      backgroundVideo: z.string().url().optional(),
      style: z.enum(['centered', 'split', 'fullscreen']),
    }).optional(),
  }).optional(),
})

// GET /api/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pageConfigs: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            formSubmissions: true,
            analyticsEvents: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)

  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if domain already exists (if being updated and different)
    if (validatedData.domain && validatedData.domain !== existingProject.domain) {
      const existingDomain = await prisma.project.findUnique({
        where: { domain: validatedData.domain }
      })

      if (existingDomain) {
        return NextResponse.json(
          { error: 'A project with this domain already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.domain !== undefined) updateData.domain = validatedData.domain
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    // Handle page config updates
    if (validatedData.templateConfig || validatedData.designConfig) {
      // If config is being updated, create a new page config and deactivate the old one
      const currentConfig = await prisma.pageConfig.findFirst({
        where: {
          projectId: projectId,
          isActive: true,
        }
      })

      if (currentConfig) {
        const newConfigData: any = {}

        if (validatedData.templateConfig) {
          newConfigData.templateConfig = validatedData.templateConfig
        } else {
          newConfigData.templateConfig = currentConfig.templateConfig
        }

        if (validatedData.designConfig) {
          newConfigData.designConfig = validatedData.designConfig
        } else {
          newConfigData.designConfig = currentConfig.designConfig
        }

        // Use transaction to ensure atomicity
        await prisma.$transaction([
          // Deactivate current config
          prisma.pageConfig.update({
            where: { id: currentConfig.id },
            data: { isActive: false }
          }),
          // Create new active config
          prisma.pageConfig.create({
            data: {
              projectId: projectId,
              templateConfig: newConfigData.templateConfig,
              designConfig: newConfigData.designConfig,
              isActive: true,
            }
          })
        ])
      }
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        pageConfigs: {
          where: { isActive: true },
          take: 1,
        },
        _count: {
          select: {
            formSubmissions: true,
            analyticsEvents: true,
          }
        }
      }
    })

    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('Failed to update project:', error)

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.')
        acc[field] = err.message
        return acc
      }, {} as Record<string, string>)

      return NextResponse.json(
        {
          error: 'Validation failed',
          fields: fieldErrors
        },
        { status: 400 }
      )
    }

    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Domain already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            formSubmissions: true,
            analyticsEvents: true,
          }
        }
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Optional: Prevent deletion of projects with data
    const hasData = existingProject._count.formSubmissions > 0 || existingProject._count.analyticsEvents > 0
    const forceDelete = request.nextUrl.searchParams.get('force') === 'true'

    if (hasData && !forceDelete) {
      return NextResponse.json(
        {
          error: 'Project has existing data. Use ?force=true to delete anyway.',
          data: {
            formSubmissions: existingProject._count.formSubmissions,
            analyticsEvents: existingProject._count.analyticsEvents,
          }
        },
        { status: 409 }
      )
    }

    // Delete project (cascade will handle related data)
    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
