'use client';

import { useEffect } from 'react';
import { Project, TemplateConfig, DesignConfig } from '@/types/database';
import LandingPageLayout from './LandingPageLayout';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import SocialProofSection from './SocialProofSection';
import EmailSignupSection from './EmailSignupSection';
import EmailSignup from '@/components/EmailSignup';

interface ProjectLandingPageProps {
  project: Project;
  templateConfig: TemplateConfig;
  designConfig: DesignConfig;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProjectLandingPage({
  project,
  templateConfig,
  designConfig,
  searchParams,
}: ProjectLandingPageProps) {
  // Track page view on mount
  useEffect(() => {
    // Extract UTM parameters from URL
    const utmParams = {
      utmSource: searchParams.utm_source as string,
      utmMedium: searchParams.utm_medium as string,
      utmCampaign: searchParams.utm_campaign as string,
    };

    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: project.slug,
        eventType: 'PAGE_VIEW',
        pathname: `/p/${project.slug}`,
        ...utmParams,
        metadata: {
          project_title: project.title,
          template_theme: designConfig.theme,
        },
      }),
    }).catch(console.error); // Don't fail the page if analytics fails
  }, [project.slug, project.title, designConfig.theme, searchParams]);

  return (
    <LandingPageLayout designConfig={designConfig} project={project}>
      {/* Hero Section */}
      <HeroSection templateConfig={templateConfig} designConfig={designConfig} project={project} />

      {/* Features Section */}
      {templateConfig.features && templateConfig.features.length > 0 && (
        <FeaturesSection features={templateConfig.features} designConfig={designConfig} />
      )}

      {/* Social Proof Section */}
      {templateConfig.socialProof && (
        <SocialProofSection socialProof={templateConfig.socialProof} designConfig={designConfig} />
      )}

      {/* Email Signup Section */}
      <EmailSignupSection designConfig={designConfig}>
        <div className="max-w-md mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: designConfig.textColor }}
          >
            {templateConfig.ctaText}
          </h2>
          <EmailSignup
            projectSlug={project.slug}
            buttonText={templateConfig.ctaText}
            showNameField={true}
            showCompanyField={false}
            showMessageField={false}
            className="w-full"
          />
        </div>
      </EmailSignupSection>

      {/* Additional Sections */}
      {templateConfig.additionalSections?.about && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg mx-auto" style={{ color: designConfig.textColor }}>
              <h2>About {project.title}</h2>
              <p>{templateConfig.additionalSections.about}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {templateConfig.additionalSections?.faq &&
        templateConfig.additionalSections.faq.length > 0 && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                className="text-3xl font-bold text-center mb-12"
                style={{ color: designConfig.textColor }}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-8">
                {templateConfig.additionalSections.faq.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: designConfig.textColor }}
                    >
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
    </LandingPageLayout>
  );
}
