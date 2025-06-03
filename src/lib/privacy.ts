import { createHash } from 'crypto';

// Privacy-preserving IP hashing
export function hashIP(ip: string): string {
  // Use a salt to prevent rainbow table attacks
  const salt = process.env.IP_HASH_SALT || 'marketprobe-default-salt';

  // Create SHA-256 hash of IP + salt
  return createHash('sha256')
    .update(ip + salt)
    .digest('hex');
}

// Extract real IP from request headers (handles proxies/load balancers)
export function getClientIP(request: Request): string {
  // Check various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a placeholder if no IP found
  return '0.0.0.0';
}

// Extract and sanitize user agent
export function sanitizeUserAgent(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;

  // Limit length and remove potentially sensitive information
  return userAgent
    .substring(0, 500) // Limit length
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[email]') // Remove email addresses
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'); // Remove IP addresses
}

// Extract and validate UTM parameters
export function extractUTMParams(url: string | URL): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const params = urlObj.searchParams;

    return {
      utmSource: sanitizeUTMParam(params.get('utm_source')),
      utmMedium: sanitizeUTMParam(params.get('utm_medium')),
      utmCampaign: sanitizeUTMParam(params.get('utm_campaign')),
      utmTerm: sanitizeUTMParam(params.get('utm_term')),
      utmContent: sanitizeUTMParam(params.get('utm_content')),
    };
  } catch {
    return {};
  }
}

// Sanitize UTM parameter values
function sanitizeUTMParam(param: string | null): string | undefined {
  if (!param) return undefined;

  // Limit length and sanitize
  return (
    param
      .substring(0, 100)
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .trim() || undefined
  );
}

// Extract UTM parameters from referrer URL
export function extractUTMFromReferrer(referrer?: string): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (!referrer) return {};

  try {
    return extractUTMParams(referrer);
  } catch {
    return {};
  }
}

// Sanitize referrer URL
export function sanitizeReferrer(referrer?: string): string | undefined {
  if (!referrer) return undefined;

  try {
    const url = new URL(referrer);
    // Only keep the origin and pathname, remove search params for privacy
    return `${url.origin}${url.pathname}`.substring(0, 500);
  } catch {
    // If URL parsing fails, return a sanitized version
    return referrer.substring(0, 500).replace(/[<>\"'&]/g, '');
  }
}

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const current = requestCounts.get(identifier);

  // Reset if window has passed
  if (!current || now > current.resetTime) {
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  // Increment count
  current.count++;
  requestCounts.set(identifier, current);

  const remaining = Math.max(0, maxRequests - current.count);
  const allowed = current.count <= maxRequests;

  return { allowed, remaining, resetTime: current.resetTime };
}

// Clean up expired rate limit entries (call periodically)
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Device type detection from user agent
export function detectDeviceType(userAgent?: string): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android')) {
    return 'mobile';
  }

  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }

  return 'desktop';
}

// Extract browser name from user agent
export function extractBrowser(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;

  const ua = userAgent.toLowerCase();

  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';

  return 'Other';
}
