// Admin Dashboard Types

export interface ProjectWithCounts {
  id: number
  slug: string
  title: string
  description: string
  domain: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  _count: {
    formSubmissions: number
    analyticsEvents: number
  }
}

export interface FormSubmissionWithProject {
  id: number
  projectId: number
  submittedAt: Date
  formData: unknown
  ipHash: string | null
  userAgent: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  project: {
    title: string
    slug: string
  }
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalSubmissions: number
  totalPageViews: number
}
