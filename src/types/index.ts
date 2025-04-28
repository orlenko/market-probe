export interface EmailSignupData {
  email: string;
  timestamp?: string;
  variant?: string;
  source?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  components?: {
    hero?: string;
    features?: string;
    cta?: string;
  };
}

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
}
