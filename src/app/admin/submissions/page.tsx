import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { EyeIcon, EnvelopeIcon, BuildingOfficeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface FormSubmissionWithProject {
  id: number;
  submittedAt: Date;
  formData: any; // JSON data from database
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  project: {
    id: number;
    title: string;
    slug: string;
  };
}

async function getFormSubmissions(): Promise<FormSubmissionWithProject[]> {
  const submissions = await prisma.formSubmission.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
    take: 100, // Limit to recent 100 submissions
  });

  return submissions;
}

function SubmissionsList({ submissions }: { submissions: FormSubmissionWithProject[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No form submissions</h3>
        <p className="mt-1 text-sm text-gray-500">
          When visitors submit forms on your landing pages, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr key={submission.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.formData.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.formData.email}
                    </div>
                    {submission.formData.company && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        {submission.formData.company}
                      </div>
                    )}
                    {submission.formData.message && (
                      <div className="text-xs text-gray-600 mt-2 flex items-start">
                        <ChatBubbleLeftIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{submission.formData.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/admin/projects/${submission.project.id}/edit`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {submission.project.title}
                </Link>
                <div className="text-xs text-gray-500">
                  /p/{submission.project.slug}
                </div>
              </td>
              <td className="px-6 py-4">
                {submission.utmSource || submission.utmMedium ? (
                  <div className="text-sm">
                    {submission.utmSource && (
                      <div className="text-gray-900">{submission.utmSource}</div>
                    )}
                    {submission.utmMedium && (
                      <div className="text-xs text-gray-500">{submission.utmMedium}</div>
                    )}
                    {submission.utmCampaign && (
                      <div className="text-xs text-gray-400">{submission.utmCampaign}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Direct</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/p/${submission.project.slug}`}
                  className="text-blue-600 hover:text-blue-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="sr-only">View landing page</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SubmissionsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Form Submissions</h1>
          <p className="mt-2 text-sm text-gray-700">
            All form submissions from your landing pages. Most recent submissions appear first.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        }>
          <SubmissionsLoadingWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function SubmissionsLoadingWrapper() {
  const submissions = await getFormSubmissions();
  return <SubmissionsList submissions={submissions} />;
}
