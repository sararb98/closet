// Database types generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clothing_items: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string
          thumbnail_url: string | null
          type: string
          season: string[]
          color: string | null
          brand: string | null
          purchase_date: string | null
          purchase_price: number | null
          notes: string | null
          is_favorite: boolean
          wear_count: number
          last_worn_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url: string
          thumbnail_url?: string | null
          type: string
          season?: string[]
          color?: string | null
          brand?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          notes?: string | null
          is_favorite?: boolean
          wear_count?: number
          last_worn_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string
          thumbnail_url?: string | null
          type?: string
          season?: string[]
          color?: string | null
          brand?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          notes?: string | null
          is_favorite?: boolean
          wear_count?: number
          last_worn_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clothing_tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      item_tags: {
        Row: {
          id: string
          item_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      calendar_outfits: {
        Row: {
          id: string
          user_id: string
          date: string
          item_id: string
          position: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          item_id: string
          position?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          item_id?: string
          position?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          default_view: string
          theme: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_view?: string
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_view?: string
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience aliases
export type ClothingItem = Tables<'clothing_items'>
export type ClothingTag = Tables<'clothing_tags'>
export type ItemTag = Tables<'item_tags'>
export type CalendarOutfit = Tables<'calendar_outfits'>
export type UserPreferences = Tables<'user_preferences'>

export type NewClothingItem = InsertTables<'clothing_items'>
export type UpdateClothingItem = UpdateTables<'clothing_items'>
export type NewCalendarOutfit = InsertTables<'calendar_outfits'>
