// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock the window.plausible function for Plausible Analytics
Object.defineProperty(window, 'plausible', {
  value: jest.fn(),
  writable: true,
});

// Mock environment variables for testing
process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'test-domain.com';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Mock console.error to avoid noisy test output for expected errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Form submission error:'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
