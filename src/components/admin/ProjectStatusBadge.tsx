type ProjectStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'GRADUATED'

interface ProjectStatusBadgeProps {
  status: ProjectStatus | string
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800'
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800'
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-yellow-100 text-yellow-800'
  },
  GRADUATED: {
    label: 'Graduated',
    className: 'bg-blue-100 text-blue-800'
  }
} as const

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status as ProjectStatus] || statusConfig.DRAFT

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
