import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { ProjectWithCounts, FormSubmissionWithProject } from '@/types/admin'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  // Get project statistics
  const [
    totalProjects,
    activeProjects,
    totalSubmissions,
    totalPageViews,
    recentProjects,
    recentSubmissions
  ] = await Promise.all([
    // Total projects count
    prisma.project.count(),

    // Active projects count
    prisma.project.count({
      where: { status: 'ACTIVE' }
    }),

    // Total form submissions (last 30 days)
    prisma.formSubmission.count({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Total page views (last 30 days)
    prisma.analyticsEvent.count({
      where: {
        eventType: 'PAGE_VIEW',
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent projects
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            formSubmissions: true,
            analyticsEvents: true
          }
        }
      }
    }),

    // Recent form submissions
    prisma.formSubmission.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
        project: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })
  ])

  return {
    stats: {
      totalProjects,
      activeProjects,
      totalSubmissions,
      totalPageViews
    },
    recentProjects: recentProjects as ProjectWithCounts[],
    recentSubmissions: recentSubmissions as FormSubmissionWithProject[]
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your MarketProbe admin dashboard. Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-500">Total Projects</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {data.stats.totalProjects}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-500">Active Projects</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-green-600">
              {data.stats.activeProjects}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-500">Form Submissions (30d)</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-blue-600">
              {data.stats.totalSubmissions}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-500">Page Views (30d)</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-purple-600">
              {data.stats.totalPageViews}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data.recentProjects.map((project: ProjectWithCounts) => (
            <div key={project.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-500">/{project.slug}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{project._count.formSubmissions} submissions</span>
                  <span>{project._count.analyticsEvents} page views</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Form Submissions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Form Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data.recentSubmissions.map((submission: FormSubmissionWithProject) => (
            <div key={submission.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {(submission.formData as any)?.email}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {submission.project.title} • {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {(submission.formData as any)?.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
