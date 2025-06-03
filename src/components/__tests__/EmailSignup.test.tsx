import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailSignup from '../EmailSignup';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.location.search for UTM parameter testing
const mockLocation = {
  search: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('EmailSignup Component', () => {
  const defaultProps = {
    projectSlug: 'test-project',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';

    // Default successful response for form submission
    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/api/form/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Thank you! You have been added to our waitlist.',
          }),
        });
      }
      // Analytics endpoint (should not affect UX even if it fails)
      if (url.includes('/api/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<EmailSignup {...defaultProps} />);

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Join Waitlist');
    });

    it('renders with custom props', () => {
      render(
        <EmailSignup
          {...defaultProps}
          buttonText="Get Early Access"
          placeholder="Your email address"
          className="custom-class"
          variant="hero"
          showNameField={false}
          showCompanyField={true}
          showMessageField={true}
        />
      );

      expect(screen.getByPlaceholderText('Your email address')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Get Early Access');
      expect(screen.queryByPlaceholderText('Your name')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Company name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about your interest...')).toBeInTheDocument();
    });

    it('renders custom fields', () => {
      const customFields = [
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel' as const,
          required: true,
          placeholder: 'Your phone number',
        },
        {
          name: 'website',
          label: 'Website',
          type: 'text' as const,
          placeholder: 'Your website URL',
        },
      ];

      render(
        <EmailSignup
          {...defaultProps}
          customFields={customFields}
        />
      );

      expect(screen.getByPlaceholderText('Your phone number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your website URL')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates email input on form submission', async () => {
      const user = userEvent.setup();
      const { container } = render(<EmailSignup {...defaultProps} />);

      const form = container.querySelector('form')!;

      // Submit form with empty email using fireEvent to bypass HTML5 validation
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Clear the error and try with invalid email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'invalid-email');

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('validates required name field', async () => {
      const user = userEvent.setup();
      const { container } = render(<EmailSignup {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const form = container.querySelector('form')!;

      // Fill valid email but leave name empty
      await user.type(emailInput, 'test@example.com');

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('validates required custom fields', async () => {
      const user = userEvent.setup();
      const customFields = [
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel' as const,
          required: true,
          placeholder: 'Your phone number',
        },
      ];

      const { container } = render(
        <EmailSignup
          {...defaultProps}
          customFields={customFields}
        />
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const nameInput = screen.getByPlaceholderText('Your name');
      const form = container.querySelector('form')!;

      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'John Doe');

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Phone Number is required')).toBeInTheDocument();
      });
    });

    it('clears field errors when user starts typing', async () => {
      const user = userEvent.setup();
      const { container } = render(<EmailSignup {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const form = container.querySelector('form')!;

      // Trigger validation error
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'test');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid email only', async () => {
      const user = userEvent.setup();
      render(<EmailSignup {...defaultProps} showNameField={false} />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/form/test-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: { email: 'test@example.com' },
            honeypot: '',
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Thank you! You have been added to our waitlist.')).toBeInTheDocument();
      });
    });

    it('submits form with all fields', async () => {
      const user = userEvent.setup();
      render(
        <EmailSignup
          {...defaultProps}
          showCompanyField={true}
          showMessageField={true}
        />
      );

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Your name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Company name'), 'Test Company');
      await user.type(screen.getByPlaceholderText('Tell us about your interest...'), 'Very interested');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/form/test-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: {
              email: 'test@example.com',
              name: 'John Doe',
              company: 'Test Company',
              message: 'Very interested',
            },
            honeypot: '',
          }),
        });
      });
    });

    it('includes UTM parameters when present', async () => {
      const user = userEvent.setup();
      mockLocation.search = '?utm_source=google&utm_medium=cpc&utm_campaign=test-campaign';

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/form/test-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: { email: 'test@example.com' },
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: 'test-campaign',
            honeypot: '',
          }),
        });
      });
    });

    it('tracks analytics after successful submission', async () => {
      const user = userEvent.setup();
      render(<EmailSignup {...defaultProps} variant="hero" showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: 'test-project',
            eventType: 'FORM_SUBMISSION',
            metadata: {
              variant: 'hero',
              formFields: ['email'],
            },
          }),
        });
      });
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      render(<EmailSignup {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const nameInput = screen.getByPlaceholderText('Your name');

      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'John Doe');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Thank you! You have been added to our waitlist.')).toBeInTheDocument();
      });

      // Form should be reset
      expect(emailInput).toHaveValue('');
      expect(nameInput).toHaveValue('');
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: 'Server error occurred',
          }),
        })
      );

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    it('handles rate limiting errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: 'Rate limit exceeded',
          }),
        })
      );

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Too many submissions. Please try again in a minute.')).toBeInTheDocument();
      });
    });

    it('handles duplicate submission errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: 'This email has already been submitted',
          }),
        })
      );

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('This email has already been submitted for this project.')).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('continues UX flow even if analytics fails', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/form/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'Thank you! You have been added to our waitlist.',
            }),
          });
        }
        if (url.includes('/api/analytics')) {
          return Promise.reject(new Error('Analytics service down'));
        }
        return Promise.reject(new Error('Unexpected API call'));
      });

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      // Form submission should still succeed
      await waitFor(() => {
        expect(screen.getByText('Thank you! You have been added to our waitlist.')).toBeInTheDocument();
      });
    });
  });

  describe('UI States', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Success!' }),
        }), 100))
      );

      render(<EmailSignup {...defaultProps} showNameField={false} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByRole('button'));

      // Should show loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
    });

    it('disables form fields during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;

      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => {
          resolvePromise = resolve;
        })
      );

      render(<EmailSignup {...defaultProps} />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Your name'), 'John Doe');

      // Start submission
      await user.click(screen.getByRole('button'));

      // Check disabled state immediately after click
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByPlaceholderText('Enter your email')).toBeDisabled();
        expect(screen.getByPlaceholderText('Your name')).toBeDisabled();
      });

      // Resolve the promise to complete the test
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<EmailSignup {...defaultProps} />);

      const form = screen.getByRole('button').closest('form');
      expect(form).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('includes honeypot field for spam protection', () => {
      const { container } = render(<EmailSignup {...defaultProps} />);

      const honeypotField = container.querySelector('input[name="honeypot"]');
      expect(honeypotField).toBeInTheDocument();
      expect(honeypotField).toHaveStyle('display: none');
      expect(honeypotField).toHaveAttribute('tabIndex', '-1');
    });

    it('shows validation errors properly', async () => {
      const { container } = render(<EmailSignup {...defaultProps} />);
      const form = container.querySelector('form')!;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        const emailError = screen.getByText('Email is required');
        const nameError = screen.getByText('Name is required');
        expect(emailError).toBeInTheDocument();
        expect(nameError).toBeInTheDocument();

        // Check that error styling is applied
        const emailInput = screen.getByPlaceholderText('Enter your email');
        expect(emailInput).toHaveClass('border-red-300');
      });
    });
  });
});
