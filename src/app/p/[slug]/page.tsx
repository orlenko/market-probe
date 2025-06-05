import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import ProjectLandingPage from '@/components/landing/ProjectLandingPage';
import { TemplateConfig, DesignConfig } from '@/types/database';

// Force dynamic rendering for project pages
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findBySlug(slug);

  if (!project || !project.pageConfigs[0]) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  const config = project.pageConfigs[0].templateConfig as unknown as TemplateConfig;

  return {
    title: `${config.headline} | ${project.title}`,
    description: config.subheadline,
    openGraph: {
      title: config.headline,
      description: config.subheadline,
      type: 'website',
      siteName: project.title,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.headline,
      description: config.subheadline,
    },
  };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Load project data from database
  const project = await db.project.findBySlug(slug);

  if (!project || project.status !== 'ACTIVE') {
    notFound();
  }

  // Get the active page configuration
  const pageConfig = project.pageConfigs[0];
  if (!pageConfig) {
    notFound();
  }

  const templateConfig = pageConfig.templateConfig as unknown as TemplateConfig;
  const designConfig = pageConfig.designConfig as unknown as DesignConfig;

  // Track page view
  // Note: This will be done client-side to avoid blocking server rendering

  // Convert database project to component-compatible format
  const projectForComponent = {
    ...project,
    description: project.description || undefined,
    domain: project.domain || undefined,
  };

  return (
    <ProjectLandingPage
      project={projectForComponent}
      templateConfig={templateConfig}
      designConfig={designConfig}
      searchParams={resolvedSearchParams}
    />
  );
}
