'use client';

import { useState } from 'react';
import { ProjectWithCounts } from '@/types/admin';
import { TemplateConfig, DesignConfig } from '@/types/database';
import ProjectForm from './ProjectForm';
import ContentEditor from './ContentEditor';
import { EyeIcon } from '@heroicons/react/24/outline';

interface ProjectEditTabsProps {
  project: ProjectWithCounts;
}

export default function ProjectEditTabs({ project }: ProjectEditTabsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'content'>('details');

  // Get the page config (there should be one per project)
  const pageConfig = (project as any).pageConfigs?.[0];
  const templateConfig = (pageConfig?.templateConfig as TemplateConfig) || {
    headline: 'Your Amazing Product',
    subheadline: 'Transform your business with our innovative solution',
    ctaText: 'Join the Waitlist',
    features: [],
    socialProof: {
      testimonials: [],
      metrics: {},
    },
    additionalSections: {
      faq: [],
    },
  };

  const designConfig = (pageConfig?.designConfig as DesignConfig) || {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    theme: 'modern' as const,
  };

  const ensureFullHexColor = (color: string): string => {
    if (!color.startsWith('#')) return '#000000';
    const hex = color.slice(1);
    if (hex.length === 3) {
      return (
        '#' +
        hex
          .split('')
          .map(c => c + c)
          .join('')
      );
    }
    if (hex.length === 6 && /^[0-9A-Fa-f]+$/.test(hex)) {
      return color;
    }
    return '#000000'; // fallback
  };

  const handleContentSave = async (
    newTemplateConfig: TemplateConfig,
    newDesignConfig: DesignConfig
  ) => {
    try {
      // Validate and clean the data before sending
      const cleanTemplateConfig = {
        headline: newTemplateConfig.headline || 'Default Headline',
        subheadline: newTemplateConfig.subheadline || 'Default Subheadline',
        ctaText: newTemplateConfig.ctaText || 'Get Started',
        features: newTemplateConfig.features || [],
        socialProof: {
          testimonials: newTemplateConfig.socialProof?.testimonials || [],
          metrics: newTemplateConfig.socialProof?.metrics || {},
        },
        additionalSections: {
          faq: newTemplateConfig.additionalSections?.faq || [],
        },
      };

      const cleanDesignConfig = {
        primaryColor: ensureFullHexColor(newDesignConfig.primaryColor || '#6366f1'),
        secondaryColor: newDesignConfig.secondaryColor
          ? ensureFullHexColor(newDesignConfig.secondaryColor)
          : undefined,
        backgroundColor: ensureFullHexColor(newDesignConfig.backgroundColor || '#ffffff'),
        textColor: ensureFullHexColor(newDesignConfig.textColor || '#1f2937'),
        fontFamily: newDesignConfig.fontFamily || 'Inter',
        theme: ['modern', 'minimal', 'bold', 'eco', 'tech', 'creative'].includes(
          newDesignConfig.theme
        )
          ? newDesignConfig.theme
          : 'modern',
        customCSS: newDesignConfig.customCSS || undefined,
      };

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateConfig: cleanTemplateConfig,
          designConfig: cleanDesignConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save changes');
      }

      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error('Error saving content:', error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const tabs = [
    {
      id: 'details',
      name: 'Project Details',
      description: 'Basic info, slug, domain, status',
    },
    {
      id: 'content',
      name: 'Landing Page Content',
      description: 'Headlines, features, design, colors',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200`}
            >
              {tab.name}
              <span className="ml-2 text-xs text-gray-400">{tab.description}</span>
            </button>
          ))}

          {/* Preview Link */}
          <div className="ml-auto">
            <a
              href={project.domain ? `https://${project.domain}` : `/p/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview Live Page
            </a>
          </div>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'details' && (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your project information, URL, and settings.
              </p>
            </div>
            <div className="p-6">
              <ProjectForm project={project} mode="edit" />
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Landing Page Content</h3>
              <p className="mt-1 text-sm text-gray-500">
                Edit the headlines, features, testimonials, and design of your landing page.
              </p>
            </div>
            <div className="p-6">
              {pageConfig ? (
                <ContentEditor
                  templateConfig={templateConfig}
                  designConfig={designConfig}
                  onSave={handleContentSave}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No page configuration found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This project doesn't have a page configuration yet. Create one from the Project
                    Details tab.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
