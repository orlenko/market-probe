import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center">
        <Link
          href="/admin/projects"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new landing page project for your idea validation.
          </p>
        </div>

        <div className="p-6">
          <ProjectForm />
        </div>
      </div>
    </div>
  )
}
