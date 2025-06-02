// MarketProbe 2.0 Database Types
// These types will be synced with Prisma models once tables are created

// Manual type definitions (will be replaced with Prisma types after migration)
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'GRADUATED'
export type AnalyticsEventType = 'PAGE_VIEW' | 'FORM_SUBMISSION' | 'BUTTON_CLICK' | 'LINK_CLICK' | 'SCROLL_DEPTH' | 'SESSION_START'

export interface Project {
  id: number
  slug: string
  title: string
  description?: string
  domain?: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface PageConfig {
  id: number
  projectId: number
  templateConfig: any // JSON
  designConfig: any // JSON
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FormSubmission {
  id: number
  projectId: number
  submittedAt: Date
  formData: any // JSON
  ipHash?: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface AnalyticsEvent {
  id: number
  projectId: number
  eventType: AnalyticsEventType
  timestamp: Date
  ipHash?: string
  userAgent?: string
  referrer?: string
  pathname?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  metadata?: any // JSON
}

// Project with related data
export type ProjectWithConfig = Project & {
  pageConfigs: PageConfig[]
  _count?: {
    formSubmissions: number
    analyticsEvents: number
  }
}

// Template configuration structure
export interface TemplateConfig {
  headline: string
  subheadline: string
  ctaText: string
  features: Array<{
    title: string
    description: string
    icon?: string
  }>
  socialProof?: {
    testimonials: Array<{
      name: string
      company?: string
      text: string
      avatar?: string
    }>
    metrics: {
      [key: string]: string // e.g., "users": "500+", "revenue": "$1M+"
    }
  }
  additionalSections?: {
    about?: string
    pricing?: any
    faq?: Array<{
      question: string
      answer: string
    }>
  }
}

// Design configuration structure
export interface DesignConfig {
  primaryColor: string
  secondaryColor?: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  theme: 'modern' | 'minimal' | 'bold' | 'eco' | 'tech' | 'creative'
  customCSS?: string
  logo?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  hero?: {
    backgroundImage?: string
    backgroundVideo?: string
    style: 'centered' | 'split' | 'fullscreen'
  }
}

// Form submission data structure
export interface FormData {
  email: string
  name?: string
  company?: string
  message?: string
  phone?: string
  [key: string]: any // Allow additional custom fields
}

// Analytics event metadata
export interface AnalyticsMetadata {
  button_text?: string
  link_url?: string
  scroll_percentage?: number
  session_duration?: number
  device_type?: 'desktop' | 'tablet' | 'mobile'
  browser?: string
  [key: string]: any
}

// API response types
export interface ProjectStats {
  pageViews: number
  formSubmissions: number
  conversionRate: number
  topReferrers: Array<{
    referrer: string | null
    _count: { referrer: number }
  }>
}

// Form validation schemas
export interface CreateProjectData {
  slug: string
  title: string
  description?: string
  domain?: string
  status?: ProjectStatus
  templateConfig: TemplateConfig
  designConfig: DesignConfig
}

export interface UpdateProjectData {
  title?: string
  description?: string
  domain?: string
  status?: ProjectStatus
  templateConfig?: TemplateConfig
  designConfig?: DesignConfig
}

// API endpoint types
export interface FormSubmissionRequest {
  formData: FormData
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface AnalyticsEventRequest {
  slug: string
  eventType: AnalyticsEventType
  referrer?: string
  pathname?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  metadata?: AnalyticsMetadata
}

// Utility types for forms and components
export type ProjectFormData = Omit<CreateProjectData, 'templateConfig' | 'designConfig'> & {
  templateConfig?: Partial<TemplateConfig>
  designConfig?: Partial<DesignConfig>
}

// Error types
export interface DatabaseError extends Error {
  code?: string
  constraint?: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
