'use client';

import { useState } from 'react';
import { TemplateConfig, DesignConfig } from '@/types/database';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ContentEditorProps {
  templateConfig: TemplateConfig;
  designConfig: DesignConfig;
  onSave: (templateConfig: TemplateConfig, designConfig: DesignConfig) => Promise<void>;
  isLoading?: boolean;
}

const THEME_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean and professional' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and focused' },
  { value: 'bold', label: 'Bold', description: 'Strong and impactful' },
  { value: 'eco', label: 'Eco', description: 'Environmental and natural' },
  { value: 'tech', label: 'Tech', description: 'Technical and innovative' },
  { value: 'creative', label: 'Creative', description: 'Artistic and unique' },
];

export default function ContentEditor({ templateConfig, designConfig, onSave, isLoading }: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [template, setTemplate] = useState<TemplateConfig>(templateConfig);

  // Ensure theme is valid on initialization
  const validThemes = ['modern', 'minimal', 'bold', 'eco', 'tech', 'creative'] as const;
  const validatedDesignConfig = {
    ...designConfig,
    theme: validThemes.includes(designConfig.theme as any) ? designConfig.theme : 'modern' as const
  };

  const [design, setDesign] = useState<DesignConfig>(validatedDesignConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(template, design);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    setTemplate({
      ...template,
      features: [...template.features, { title: '', description: '', icon: '' }],
    });
  };

  const removeFeature = (index: number) => {
    setTemplate({
      ...template,
      features: template.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, field: keyof TemplateConfig['features'][0], value: string) => {
    const newFeatures = [...template.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setTemplate({ ...template, features: newFeatures });
  };

  const addTestimonial = () => {
    const socialProof = template.socialProof || { testimonials: [], metrics: {} };
    setTemplate({
      ...template,
      socialProof: {
        ...socialProof,
        testimonials: [...socialProof.testimonials, { name: '', company: '', text: '', avatar: '' }],
      },
    });
  };

  const removeTestimonial = (index: number) => {
    if (!template.socialProof) return;
    setTemplate({
      ...template,
      socialProof: {
        ...template.socialProof,
        testimonials: template.socialProof.testimonials.filter((_, i) => i !== index),
      },
    });
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    if (!template.socialProof) return;
    const newTestimonials = [...template.socialProof.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTemplate({
      ...template,
      socialProof: {
        ...template.socialProof,
        testimonials: newTestimonials,
      },
    });
  };

  const addFAQ = () => {
    const additionalSections = template.additionalSections || {};
    const faq = additionalSections.faq || [];
    setTemplate({
      ...template,
      additionalSections: {
        ...additionalSections,
        faq: [...faq, { question: '', answer: '' }],
      },
    });
  };

  const removeFAQ = (index: number) => {
    if (!template.additionalSections?.faq) return;
    setTemplate({
      ...template,
      additionalSections: {
        ...template.additionalSections,
        faq: template.additionalSections.faq.filter((_, i) => i !== index),
      },
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (!template.additionalSections?.faq) return;
    const newFAQ = [...template.additionalSections.faq];
    newFAQ[index] = { ...newFAQ[index], [field]: value };
    setTemplate({
      ...template,
      additionalSections: {
        ...template.additionalSections,
        faq: newFAQ,
      },
    });
  };

  const tabs = [
    { id: 'content', name: 'Content', description: 'Headlines, features, testimonials' },
    { id: 'design', name: 'Design', description: 'Colors, themes, styling' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              {tab.name}
              <span className="ml-2 text-xs text-gray-400">{tab.description}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={template.headline}
                  onChange={(e) => setTemplate({ ...template, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your amazing product headline..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subheadline
                </label>
                <textarea
                  value={template.subheadline}
                  onChange={(e) => setTemplate({ ...template, subheadline: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the value proposition in more detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call-to-Action Button Text
                </label>
                <input
                  type="text"
                  value={template.ctaText}
                  onChange={(e) => setTemplate({ ...template, ctaText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Join the Waitlist"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
              <button
                onClick={addFeature}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Feature
              </button>
            </div>
            <div className="space-y-4">
              {template.features.map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Feature {index + 1}</h4>
                    <button
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="Feature title"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Feature description"
                      rows={2}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                      placeholder="Icon name (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Proof</h3>

            {/* Testimonials */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">Testimonials</h4>
                <button
                  onClick={addTestimonial}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Testimonial
                </button>
              </div>
              <div className="space-y-3">
                {(template.socialProof?.testimonials || []).map((testimonial, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">Testimonial {index + 1}</h5>
                      <button
                        onClick={() => removeTestimonial(index)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={testimonial.company || ''}
                        onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                        placeholder="Company (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      value={testimonial.text}
                      onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                      placeholder="Testimonial text"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Metrics</h4>
              <div className="text-sm text-gray-500 mb-2">Add key numbers to showcase your traction</div>
              <div className="space-y-2">
                {Object.entries(template.socialProof?.metrics || {}).map(([key, value], index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newMetrics = { ...template.socialProof?.metrics };
                        delete newMetrics[key];
                        newMetrics[e.target.value] = value;
                        setTemplate({
                          ...template,
                          socialProof: {
                            testimonials: template.socialProof?.testimonials || [],
                            metrics: newMetrics
                          } as any,
                        });
                      }}
                      placeholder="Metric name (e.g., 'users')"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newMetrics = { ...template.socialProof?.metrics };
                        newMetrics[key] = e.target.value;
                        setTemplate({
                          ...template,
                          socialProof: {
                            testimonials: template.socialProof?.testimonials || [],
                            metrics: newMetrics
                          } as any,
                        });
                      }}
                      placeholder="Value (e.g., '500+')"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const socialProof = template.socialProof || { testimonials: [], metrics: {} };
                    setTemplate({
                      ...template,
                      socialProof: {
                        ...socialProof,
                        metrics: { ...socialProof.metrics, [`metric_${Date.now()}`]: '' },
                      },
                    });
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Metric
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">FAQ</h3>
              <button
                onClick={addFAQ}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add FAQ
              </button>
            </div>
            <div className="space-y-4">
              {(template.additionalSections?.faq || []).map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">FAQ {index + 1}</h4>
                    <button
                      onClick={() => removeFAQ(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      placeholder="Question"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THEME_OPTIONS.map((theme) => (
                <label
                  key={theme.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                    design.theme === theme.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={design.theme === theme.value}
                    onChange={(e) => {
                      const newTheme = e.target.value as DesignConfig['theme'];
                      if (['modern', 'minimal', 'bold', 'eco', 'tech', 'creative'].includes(newTheme)) {
                        setDesign({ ...design, theme: newTheme });
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{theme.label}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={design.secondaryColor || '#8b5cf6'}
                    onChange={(e) => setDesign({ ...design, secondaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={design.secondaryColor || ''}
                    onChange={(e) => setDesign({ ...design, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={design.backgroundColor}
                    onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={design.backgroundColor}
                    onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={design.textColor}
                    onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={design.textColor}
                    onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={design.fontFamily}
                onChange={(e) => setDesign({ ...design, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="system-ui">System UI</option>
              </select>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional CSS (Advanced)
              </label>
              <textarea
                value={design.customCSS || ''}
                onChange={(e) => setDesign({ ...design, customCSS: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="/* Custom CSS rules */&#10;.hero-section {&#10;  /* Your custom styles */&#10;}"
              />
              <p className="mt-2 text-sm text-gray-500">
                Add custom CSS to override default styling. Use with caution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
