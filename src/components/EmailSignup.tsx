'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface EmailSignupProps {
  buttonText?: string;
  placeholder?: string;
  className?: string;
  variant?: string;
}

export default function EmailSignup({
  buttonText = 'Get Early Access',
  placeholder = 'Enter your email',
  className = '',
  variant = 'default',
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use a regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Replace with your actual Formspree endpoint
      const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || 'your-formspree-id';

      const response = await fetch(`https://formspree.io/f/${formspreeEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          variant
        }),
      });

      if (response.ok) {
        setEmail('');
        setStatus('success');
        setMessage('Thank you! You have been added to our waitlist.');

        // Track signup success
        trackEvent({
          name: 'signup_success',
          properties: { variant }
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');

      // Track signup error
      trackEvent({
        name: 'signup_error',
        properties: { variant, error: (error as Error).message }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
