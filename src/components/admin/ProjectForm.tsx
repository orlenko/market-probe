'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectWithCounts } from '@/types/admin'

interface ProjectFormProps {
  project?: ProjectWithCounts
  mode?: 'create' | 'edit'
}

interface FormData {
  title: string
  slug: string
  description: string
  domain: string
  status: string
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  description: '',
  domain: '',
  status: 'DRAFT'
}

export default function ProjectForm({ project, mode = 'create' }: ProjectFormProps) {
  const [formData, setFormData] = useState<FormData>(
    project
      ? {
          title: project.title,
          slug: project.slug,
          description: project.description || '',
          domain: project.domain || '',
          status: project.status
        }
      : initialFormData
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const router = useRouter()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: mode === 'create' ? generateSlug(title) : prev.slug
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain (e.g., example.com)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const url = mode === 'create'
        ? '/api/admin/projects'
        : `/api/admin/projects/${project?.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          domain: formData.domain || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save project')
      }

      const result = await response.json()

      // Redirect to projects list or project edit page
      if (mode === 'create') {
        router.push('/admin/projects')
      } else if (mode === 'edit') {
        router.push('/admin/projects')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert(error instanceof Error ? error.message : 'Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Project Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          placeholder="AI Writing Assistant"
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          URL Slug *
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            /p/
          </span>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            placeholder="ai-writing-assistant"
            required
          />
        </div>
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        <p className="mt-1 text-sm text-gray-500">
          This will be the URL path for your project: /p/{formData.slug || 'your-slug'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          placeholder="A brief description of your project..."
        />
      </div>

      {/* Custom Domain */}
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
          Custom Domain (Optional)
        </label>
        <input
          type="text"
          id="domain"
          name="domain"
          value={formData.domain}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          placeholder="example.com"
        />
        {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
        <p className="mt-1 text-sm text-gray-500">
          Leave empty to use the default path (/p/slug). Add a custom domain to use your own URL.
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="GRADUATED">Graduated</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Draft: Not visible to visitors. Active: Live and collecting data. Archived: Disabled. Graduated: Successfully validated.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (mode === 'create' ? 'Creating...' : 'Updating...')
            : (mode === 'create' ? 'Create Project' : 'Update Project')
          }
        </button>
      </div>
    </form>
  )
}
