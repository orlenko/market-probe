import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { prisma } from '@/lib/db';
import { ProjectWithCounts } from '@/types/admin';
import { TemplateConfig, DesignConfig } from '@/types/database';
import ProjectEditTabs from '@/components/admin/ProjectEditTabs';

export const dynamic = 'force-dynamic';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: number): Promise<ProjectWithCounts | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
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
          },
        },
      },
    });

    return project as any;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
      </div>

      {/* Project Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Currently editing: {project.title}
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                URL: <span className="font-mono">/p/{project.slug}</span>
                {project.domain && (
                  <>
                    {' '}
                    • Custom domain: <span className="font-mono">{project.domain}</span>
                  </>
                )}
              </p>
              <p className="mt-1">
                {project._count.formSubmissions} submissions • {project._count.analyticsEvents} page
                views
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProjectEditTabs project={project} />
    </div>
  );
}
