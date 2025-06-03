/**
 * Utility to check if Clerk is properly configured with a valid publishable key
 * Returns false for placeholder keys, CI build keys, or invalid formats
 */
export function hasValidClerkKey(): boolean {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return !!(clerkKey &&
    clerkKey.startsWith('pk_') &&
    clerkKey.length > 20 &&
    !clerkKey.includes('placeholder') &&
    !clerkKey.includes('ci_build') &&
    !clerkKey.includes('test_only'));
}

/**
 * Get the Clerk publishable key only if it's valid
 */
export function getValidClerkKey(): string | undefined {
  return hasValidClerkKey() ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : undefined;
}
