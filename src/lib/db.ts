import { PrismaClient } from '@prisma/client'

// Prisma Client singleton pattern for Next.js
// Prevents multiple instances in development due to hot reloading

declare global {
  var __prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })
}

// Use global variable in development to prevent multiple instances
// In production, create a new instance each time
const prisma = globalThis.__prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export { prisma }

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

// Transaction helper for complex operations
export async function withTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn)
}

// Database utilities for common operations
export const db = {
  // Project operations
  project: {
    findBySlug: (slug: string) =>
      prisma.project.findUnique({
        where: { slug },
        include: { pageConfigs: { where: { isActive: true } } }
      }),

    findByDomain: (domain: string) =>
      prisma.project.findUnique({
        where: { domain },
        include: { pageConfigs: { where: { isActive: true } } }
      }),

    list: (status?: string) =>
      prisma.project.findMany({
        where: status ? { status: status as any } : undefined,
        include: {
          _count: {
            select: {
              formSubmissions: true,
              analyticsEvents: true,
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
  },

  // Analytics operations
  analytics: {
    trackEvent: (data: {
      projectId: number
      eventType: string
      ipHash?: string
      userAgent?: string
      referrer?: string
      pathname?: string
      utmSource?: string
      utmMedium?: string
      utmCampaign?: string
      metadata?: any
    }) =>
      prisma.analyticsEvent.create({ data: data as any }),

    getProjectStats: async (projectId: number, days = 30) => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const [pageViews, formSubmissions, topReferrers] = await Promise.all([
        prisma.analyticsEvent.count({
          where: {
            projectId,
            eventType: 'PAGE_VIEW',
            timestamp: { gte: since }
          }
        }),
        prisma.formSubmission.count({
          where: {
            projectId,
            submittedAt: { gte: since }
          }
        }),
        prisma.analyticsEvent.groupBy({
          by: ['referrer'],
          where: {
            projectId,
            eventType: 'PAGE_VIEW',
            timestamp: { gte: since },
            referrer: { not: null }
          },
          _count: { referrer: true },
          orderBy: { _count: { referrer: 'desc' } },
          take: 10
        })
      ])

      return {
        pageViews,
        formSubmissions,
        conversionRate: pageViews > 0 ? (formSubmissions / pageViews) * 100 : 0,
        topReferrers
      }
    }
  },

  // Form submission operations
  forms: {
    submit: (data: {
      projectId: number
      formData: any
      ipHash?: string
      userAgent?: string
      referrer?: string
      utmSource?: string
      utmMedium?: string
      utmCampaign?: string
    }) =>
      prisma.formSubmission.create({ data }),

    getSubmissions: (projectId: number, limit = 50) =>
      prisma.formSubmission.findMany({
        where: { projectId },
        orderBy: { submittedAt: 'desc' },
        take: limit
      })
  }
}
