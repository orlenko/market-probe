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
    },

    // Enhanced analytics for dashboard charts
    getDetailedStats: async (projectId: number, days = 30) => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const [
        pageViews,
        formSubmissions,
        dailyPageViews,
        dailySubmissions,
        utmSources,
        topReferrers,
        deviceTypes,
        browsers
      ] = await Promise.all([
        // Total page views
        prisma.analyticsEvent.count({
          where: {
            projectId,
            eventType: 'PAGE_VIEW',
            timestamp: { gte: since }
          }
        }),

        // Total form submissions
        prisma.formSubmission.count({
          where: {
            projectId,
            submittedAt: { gte: since }
          }
        }),

        // Daily page views for time series
        prisma.$queryRaw`
          SELECT
            DATE(timestamp) as date,
            COUNT(*)::int as count
          FROM analytics_events
          WHERE project_id = ${projectId}
            AND event_type = 'PAGE_VIEW'
            AND timestamp >= ${since}
          GROUP BY DATE(timestamp)
          ORDER BY date
        `,

        // Daily form submissions for time series
        prisma.$queryRaw`
          SELECT
            DATE(submitted_at) as date,
            COUNT(*)::int as count
          FROM form_submissions
          WHERE project_id = ${projectId}
            AND submitted_at >= ${since}
          GROUP BY DATE(submitted_at)
          ORDER BY date
        `,

        // UTM sources breakdown
        prisma.analyticsEvent.groupBy({
          by: ['utmSource'],
          where: {
            projectId,
            eventType: 'PAGE_VIEW',
            timestamp: { gte: since },
            utmSource: { not: null }
          },
          _count: { utmSource: true },
          orderBy: { _count: { utmSource: 'desc' } },
          take: 10
        }),

        // Top referrers
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
        }),

        // Device types from metadata
        prisma.$queryRaw`
          SELECT
            metadata->>'device_type' as device_type,
            COUNT(*)::int as count
          FROM analytics_events
          WHERE project_id = ${projectId}
            AND event_type = 'PAGE_VIEW'
            AND timestamp >= ${since}
            AND metadata->>'device_type' IS NOT NULL
          GROUP BY metadata->>'device_type'
          ORDER BY count DESC
        `,

        // Browsers from metadata
        prisma.$queryRaw`
          SELECT
            metadata->>'browser' as browser,
            COUNT(*)::int as count
          FROM analytics_events
          WHERE project_id = ${projectId}
            AND event_type = 'PAGE_VIEW'
            AND timestamp >= ${since}
            AND metadata->>'browser' IS NOT NULL
          GROUP BY metadata->>'browser'
          ORDER BY count DESC
          LIMIT 10
        `
      ])

      return {
        summary: {
          pageViews,
          formSubmissions,
          conversionRate: pageViews > 0 ? (formSubmissions / pageViews) * 100 : 0,
          period: { days, from: since, to: new Date() }
        },
        timeSeries: {
          pageViews: dailyPageViews,
          submissions: dailySubmissions
        },
        sources: {
          utm: utmSources,
          referrers: topReferrers
        },
        technology: {
          devices: deviceTypes,
          browsers: browsers
        }
      }
    },

    // Get all projects overview for admin dashboard
    getAllProjectsStats: async (days = 30) => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const projects = await prisma.project.findMany({
        include: {
          _count: {
            select: {
              analyticsEvents: {
                where: {
                  eventType: 'PAGE_VIEW',
                  timestamp: { gte: since }
                }
              },
              formSubmissions: {
                where: {
                  submittedAt: { gte: since }
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return projects.map((project: any) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        status: project.status,
        pageViews: project._count.analyticsEvents,
        formSubmissions: project._count.formSubmissions,
        conversionRate: project._count.analyticsEvents > 0
          ? (project._count.formSubmissions / project._count.analyticsEvents) * 100
          : 0
      }))
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
