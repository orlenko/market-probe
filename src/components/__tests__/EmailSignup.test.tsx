import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailSignup from '../EmailSignup';
import * as analytics from '@/lib/analytics';

// Mock the analytics module
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  })
) as jest.Mock;

describe('EmailSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Get Early Access');
  });

  it('renders with custom props', () => {
    render(
      <EmailSignup
        buttonText="Join Waitlist"
        placeholder="Your email address"
        className="custom-class"
        variant="footer"
      />
    );

    expect(screen.getByPlaceholderText('Your email address')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Join Waitlist');
  });

  it('validates email input', async () => {
    const { container } = render(<EmailSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const form = container.querySelector('form');

    // Submit with empty input
    fireEvent.submit(form!);

    // Wait for validation message to appear
    await waitFor(() => {
      const errorMessage = container.querySelector('.text-red-600');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toBe('Please enter a valid email address');
    });

    // Input invalid email and submit
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form!);

    // Wait for validation message
    await waitFor(() => {
      const errorMessage = container.querySelector('.text-red-600');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toBe('Please enter a valid email address');
    });
  });

  it('submits the form with valid email', async () => {
    render(<EmailSignup variant="hero" />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button');

    // Input valid email and submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://formspree.io/f/test-formspree-id',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );

      expect(analytics.trackEvent).toHaveBeenCalledWith({
        name: 'signup_success',
        properties: { variant: 'hero' }
      });

      expect(screen.getByText('Thank you! You have been added to our waitlist.')).toBeInTheDocument();
    });
  });
});
