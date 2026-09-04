import { ClothingItem, ClothingTag } from './database'

// Clothing type categories
export const CLOTHING_TYPES = [
  { value: 'shirt', label: 'Shirt', icon: '👔' },
  { value: 't-shirt', label: 'T-Shirt', icon: '👕' },
  { value: 'blouse', label: 'Blouse', icon: '👚' },
  { value: 'sweater', label: 'Sweater', icon: '🧥' },
  { value: 'jacket', label: 'Jacket', icon: '🧥' },
  { value: 'coat', label: 'Coat', icon: '🧥' },
  { value: 'pants', label: 'Pants', icon: '👖' },
  { value: 'jeans', label: 'Jeans', icon: '👖' },
  { value: 'shorts', label: 'Shorts', icon: '🩳' },
  { value: 'skirt', label: 'Skirt', icon: '👗' },
  { value: 'dress', label: 'Dress', icon: '👗' },
  { value: 'shoes', label: 'Shoes', icon: '👞' },
  { value: 'sneakers', label: 'Sneakers', icon: '👟' },
  { value: 'boots', label: 'Boots', icon: '🥾' },
  { value: 'sandals', label: 'Sandals', icon: '🩴' },
  { value: 'accessories', label: 'Accessories', icon: '💎' },
  { value: 'bag', label: 'Bag', icon: '👜' },
  { value: 'hat', label: 'Hat', icon: '🧢' },
  { value: 'jewelry', label: 'Jewelry', icon: '💍' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export type ClothingType = typeof CLOTHING_TYPES[number]['value']

// Seasons
export const SEASONS = [
  { value: 'spring', label: 'Spring', icon: '🌸', color: '#10b981' },
  { value: 'summer', label: 'Summer', icon: '☀️', color: '#f59e0b' },
  { value: 'fall', label: 'Fall', icon: '🍂', color: '#f97316' },
  { value: 'winter', label: 'Winter', icon: '❄️', color: '#3b82f6' },
  { value: 'all-season', label: 'All Season', icon: '🌍', color: '#8b5cf6' },
] as const

export type Season = typeof SEASONS[number]['value']

// Colors
// Each solid color's `hex` doubles as the reference "centroid" that
// lib/utils/color.ts uses to auto-classify an exact eyedropper pick into
// this category (nearest match in perceptual Lab color space). Keep hexes
// representative of the category's typical midpoint, not just a nice-looking
// swatch color, or auto-matching will skew.
export const COLORS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#ffffff' },
  { value: 'gray', label: 'Gray', hex: '#6b7280' },
  { value: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'burgundy', label: 'Burgundy', hex: '#7f1d3a' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
  { value: 'purple', label: 'Purple', hex: '#8b5cf6' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'olive', label: 'Olive', hex: '#5f6b3a' },
  { value: 'teal', label: 'Teal', hex: '#14b8a6' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'brown', label: 'Brown', hex: '#92400e' },
  { value: 'tan', label: 'Tan', hex: '#c2a878' },
  { value: 'beige', label: 'Beige', hex: '#d4c4a8' },
  { value: 'cream', label: 'Cream', hex: '#f5f0e1' },
  { value: 'gold', label: 'Gold', hex: '#d4af37' },
  { value: 'silver', label: 'Silver', hex: '#c0c0c0' },
  { value: 'multi', label: 'Multi', hex: 'linear-gradient(45deg, #f00, #0f0, #00f)' },
] as const

export type Color = typeof COLORS[number]['value']

// 'multi' isn't a real solid color (it's a gradient swatch meaning
// "multicolor/patterned"), so it's excluded from nearest-color matching.
export type SolidColor = Exclude<Color, 'multi'>

// Extended clothing item with tags
export interface ClothingItemWithTags extends ClothingItem {
  tags?: ClothingTag[]
}

// Filter state
export interface ClothingFilters {
  type: string | null
  season: string | null
  color: string | null
  tags: string[]
  search: string
  favorites: boolean
}

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-worn', label: 'Most Worn' },
  { value: 'least-worn', label: 'Least Worn' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']
