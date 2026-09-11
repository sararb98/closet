import { ClothingItem, Outfit } from './database'

export const OUTFIT_OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'formal', label: 'Formal' },
  { value: 'date', label: 'Date' },
  { value: 'event', label: 'Event' },
  { value: 'travel', label: 'Travel' },
  { value: 'sport', label: 'Sport' },
  { value: 'other', label: 'Other' },
] as const

export type OutfitOccasion = typeof OUTFIT_OCCASIONS[number]['value']

export interface OutfitWithItems extends Outfit {
  items: ClothingItem[]
}