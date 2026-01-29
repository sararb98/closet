import { CalendarOutfit, ClothingItem } from './database'

// Calendar outfit with item details
export interface CalendarOutfitWithItem extends CalendarOutfit {
  clothing_item?: ClothingItem
}

// Calendar day with outfits
export interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  outfits: CalendarOutfitWithItem[]
}

// Calendar view state
export interface CalendarViewState {
  currentMonth: Date
  selectedDate: Date | null
  outfits: Map<string, CalendarOutfitWithItem[]>
}

// Month navigation
export type MonthNavigation = 'prev' | 'next' | 'today'
