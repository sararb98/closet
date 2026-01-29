// App-wide constants

export const APP_NAME = 'Virtual Closet'
export const APP_DESCRIPTION = 'Organize your wardrobe, plan your outfits'

// Navigation items
export const NAV_ITEMS = [
  { href: '/closet', label: 'Closet', icon: 'Shirt' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/add', label: 'Add', icon: 'Plus' },
  { href: '/insights', label: 'Insights', icon: 'BarChart3' },
] as const

// Supabase storage
export const STORAGE_BUCKET = 'clothing-images'
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Pagination
export const ITEMS_PER_PAGE = 20

// Animation durations (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
