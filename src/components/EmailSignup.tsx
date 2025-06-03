'use client';

import { useState } from 'react';

interface EmailSignupProps {
  projectSlug: string; // Required: which project this form belongs to
  buttonText?: string;
  placeholder?: string;
  className?: string;
  variant?: string;
  showNameField?: boolean;
  showCompanyField?: boolean;
  showMessageField?: boolean;
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel';
    required?: boolean;
    placeholder?: string;
  }>;
}

interface FormData {
  email: string;
  name?: string;
  company?: string;
  message?: string;
  [key: string]: any;
}

export default function EmailSignup({
  projectSlug,
  buttonText = 'Join Waitlist',
  placeholder = 'Enter your email',
  className = '',
  variant = 'default',
  showNameField = true,
  showCompanyField = false,
  showMessageField = false,
  customFields = [],
}: EmailSignupProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: showNameField ? '' : undefined,
    company: showCompanyField ? '' : undefined,
    message: showMessageField ? '' : undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation (if shown and required)
    if (showNameField && !formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    // Custom fields validation
    customFields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const extractUTMParams = () => {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus('error');
      setMessage('Please correct the errors above');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setStatus('idle');

    try {
      // Prepare form data, excluding undefined fields
      const cleanFormData: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanFormData[key] = value;
        }
      });

      // Add custom fields
      customFields.forEach(field => {
        if (formData[field.name]) {
          cleanFormData[field.name] = formData[field.name];
        }
      });

      const submissionData = {
        formData: cleanFormData,
        ...extractUTMParams(),
        // Honeypot field for spam protection (hidden in actual form)
        honeypot: '',
      };

      const response = await fetch(`/api/form/${projectSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form
        setFormData({
          email: '',
          name: showNameField ? '' : undefined,
          company: showCompanyField ? '' : undefined,
          message: showMessageField ? '' : undefined,
        });

        setStatus('success');
        setMessage(result.message || 'Thank you! You have been added to our waitlist.');

        // Track successful submission in analytics
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: projectSlug,
            eventType: 'FORM_SUBMISSION',
            metadata: {
              variant,
              formFields: Object.keys(cleanFormData),
            },
          }),
        }).catch(console.error); // Don't fail the UX if analytics fails
      } else {
        throw new Error(result.error || 'Form submission failed');
      }
    } catch (error) {
      setStatus('error');

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('Rate limit')) {
          setMessage('Too many submissions. Please try again in a minute.');
        } else if (error.message.includes('already been submitted')) {
          setMessage('This email has already been submitted for this project.');
        } else {
          setMessage(error.message || 'Something went wrong. Please try again.');
        }
      } else {
        setMessage('Something went wrong. Please try again.');
      }

      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field (always shown) */}
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
              fieldErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            required
            disabled={isSubmitting}
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        {/* Name field (optional) */}
        {showNameField && (
          <div>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Your name"
              className={`w-full px-4 py-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                fieldErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
          </div>
        )}

        {/* Company field (optional) */}
        {showCompanyField && (
          <div>
            <input
              type="text"
              value={formData.company || ''}
              onChange={e => handleInputChange('company', e.target.value)}
              placeholder="Company name"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Message field (optional) */}
        {showMessageField && (
          <div>
            <textarea
              value={formData.message || ''}
              onChange={e => handleInputChange('message', e.target.value)}
              placeholder="Tell us about your interest..."
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors resize-y"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Custom fields */}
        {customFields.map(field => (
          <div key={field.name}>
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={e => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder || field.label}
              className={`w-full px-4 py-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                fieldErrors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              required={field.required}
              disabled={isSubmitting}
            />
            {fieldErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </button>

        {/* Honeypot field for spam protection (hidden) */}
        <input
          type="text"
          name="honeypot"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
      </form>

      {/* Status message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
