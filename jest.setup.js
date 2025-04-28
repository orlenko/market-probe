// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock the window.plausible function
if (typeof window !== 'undefined') {
  window.plausible = jest.fn();
}

// Mock environment variables
process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT = 'test-formspree-id';
process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'test-domain.com';
