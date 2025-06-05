import { ABTestVariant } from '@/types';
import { trackEvent } from './analytics';

// This would be loaded from environment variables or configuration in a real app
const defaultVariants: ABTestVariant[] = [
  {
    id: 'default',
    name: 'Default Variant',
    weight: 100,
    components: {
      hero: 'default',
      features: 'default',
      cta: 'default',
    },
  },
];

/**
 * Select a variant based on weights
 */
export const selectVariant = (variants: ABTestVariant[] = defaultVariants): ABTestVariant => {
  // If running on server or only one variant, return the first one
  if (typeof window === 'undefined' || variants.length === 1) {
    return variants[0];
  }

  // Check if a variant is already stored in session
  const storedVariant = sessionStorage.getItem('abTestVariant');
  if (storedVariant) {
    const found = variants.find(v => v.id === storedVariant);
    if (found) return found;
  }

  // Calculate weights
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  let random = Math.random() * totalWeight;

  // Select variant based on weight
  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) {
      // Store the selected variant
      sessionStorage.setItem('abTestVariant', variant.id);

      // Track the variant assignment
      trackEvent({
        name: 'variant_assigned',
        properties: { variant_id: variant.id, variant_name: variant.name },
      });

      return variant;
    }
  }

  // Fallback to first variant
  return variants[0];
};

/**
 * Get component variant based on current test
 */
export const getComponentVariant = (
  componentName: 'hero' | 'features' | 'cta',
  variants: ABTestVariant[] = defaultVariants
): string => {
  const variant = selectVariant(variants);
  return variant.components?.[componentName] || 'default';
};
