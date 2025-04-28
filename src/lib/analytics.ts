import { AnalyticsEvent } from '@/types';

/**
 * Track a custom event in Plausible Analytics
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event.name, { props: event.properties });
  } else {
    console.debug('Plausible not loaded or running in development', event);
  }
};

/**
 * Track page view in Plausible Analytics
 */
export const trackPageView = (url: string): void => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { u: url });
  }
};

// Add TypeScript declaration for Plausible
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean | null>; u?: string }
    ) => void;
  }
}
