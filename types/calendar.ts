import { CalendarOutfit, CalendarOutfitInstance, ClothingItem } from './database'

export interface CalendarOutfitWithItem extends CalendarOutfit {
  clothing_item?: ClothingItem
}

export type ScheduledOutfitStatus = 'planned' | 'worn' | 'skipped'

export interface ScheduledOutfitWithItems extends CalendarOutfitInstance {
  status: ScheduledOutfitStatus
  items: ClothingItem[]
}

// Calendar day with outfits
export interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  outfits: ScheduledOutfitWithItems[]
}

// Calendar view state
export interface CalendarViewState {
  currentMonth: Date
  selectedDate: Date | null
  outfits: Map<string, ScheduledOutfitWithItems[]>
}

// Month navigation
export type MonthNavigation = 'prev' | 'next' | 'today'
