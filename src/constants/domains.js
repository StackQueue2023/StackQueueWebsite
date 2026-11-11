/**
 * Shared Domain & Category Constants
 * Single Source of Truth for domain and category options across the platform
 */

export const DOMAIN_CATEGORIES = [
  'Enterprise Software',
  'Artificial Intelligence',
  'Modern Web Engineering',
  'Interview Preparation',
  'Cloud Architecture',
  'Security Engineering',
  'Cross-Platform Mobile',
  'Data Architecture'
];

export const DOMAIN_FILTER_OPTIONS = ['All', ...DOMAIN_CATEGORIES];

export const DEFAULT_DOMAIN_CATEGORY = 'Enterprise Software';

// Map legacy category names to new domain categories for backwards compatibility
export const CATEGORY_COMPATIBILITY_MAP = {
  'Software Development': 'Enterprise Software',
  'Data Science & AI': 'Artificial Intelligence',
  'Web Engineering': 'Modern Web Engineering',
  'Web Development': 'Modern Web Engineering',
  'Cloud & DevOps': 'Cloud Architecture',
  'Cybersecurity': 'Security Engineering',
  'Mobile Development': 'Cross-Platform Mobile',
  'Data & Analytics': 'Data Architecture'
};

export const normalizeCategory = (category) => {
  if (!category) return DEFAULT_DOMAIN_CATEGORY;
  if (CATEGORY_COMPATIBILITY_MAP[category]) {
    return CATEGORY_COMPATIBILITY_MAP[category];
  }
  return category;
};
