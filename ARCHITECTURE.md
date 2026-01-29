# Virtual Closet Web App - Architecture Document

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js App)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Closet    │  │  Calendar   │  │  Add Item   │  │  Insights   │        │
│  │    View     │  │    View     │  │    View     │  │    View     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │               │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐        │
│  │                     App Shell (Layout)                          │        │
│  │              Navigation | Auth State | Theme                    │        │
│  └─────────────────────────────┬───────────────────────────────────┘        │
│                                │                                            │
│  ┌─────────────────────────────┴───────────────────────────────────┐        │
│  │                    Shared Components                             │        │
│  │   shadcn/ui | Motion.dev Animations | Custom Components          │        │
│  └─────────────────────────────┬───────────────────────────────────┘        │
│                                │                                            │
│  ┌─────────────────────────────┴───────────────────────────────────┐        │
│  │                    State Management                              │        │
│  │   React Context | Server Components | Optimistic Updates         │        │
│  └─────────────────────────────┬───────────────────────────────────┘        │
│                                │                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    Supabase Client      │
                    │   (Browser + Server)    │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                                │          SUPABASE                          │
│  ┌─────────────┐  ┌────────────┴───────────┐  ┌─────────────┐              │
│  │    Auth     │  │      PostgreSQL        │  │   Storage   │              │
│  │   (Email)   │  │                        │  │  (Images)   │              │
│  └─────────────┘  │  - clothing_items      │  └─────────────┘              │
│                   │  - clothing_tags       │                                │
│                   │  - calendar_outfits    │                                │
│                   │  - item_tags (join)    │                                │
│                   └────────────────────────┘                                │
│                                                                             │
│                   ┌────────────────────────┐                                │
│                   │   Row Level Security   │                                │
│                   │   (User Isolation)     │                                │
│                   └────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → Client Component → Server Action/API → Supabase → Response
     ↑                                                              │
     └────────────── Optimistic Update ←────────────────────────────┘
```

## Folder Structure

```
closet/
├── app/
│   ├── globals.css
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing/redirect
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── signup/
│   │   │   └── page.tsx           # Signup page
│   │   └── layout.tsx             # Auth layout
│   ├── (app)/
│   │   ├── layout.tsx             # App shell with navigation
│   │   ├── closet/
│   │   │   └── page.tsx           # Closet view
│   │   ├── calendar/
│   │   │   └── page.tsx           # Calendar view
│   │   ├── add/
│   │   │   └── page.tsx           # Add item page
│   │   └── insights/
│   │       └── page.tsx           # Insights/charts page
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts       # Auth callback handler
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── calendar.tsx
│   │   ├── chart.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── auth/
│   │   ├── auth-form.tsx          # Login/Signup form
│   │   └── auth-provider.tsx      # Auth context
│   ├── closet/
│   │   ├── clothing-grid.tsx      # Grid of clothing items
│   │   ├── clothing-card.tsx      # Individual item card
│   │   ├── clothing-filters.tsx   # Filter controls
│   │   ├── clothing-modal.tsx     # Item detail modal
│   │   └── draggable-item.tsx     # Draggable wrapper
│   ├── calendar/
│   │   ├── calendar-view.tsx      # Monthly calendar
│   │   ├── calendar-day.tsx       # Individual day cell
│   │   └── outfit-assignment.tsx  # Outfit in calendar
│   ├── forms/
│   │   ├── item-form.tsx          # Add/Edit item form
│   │   └── image-upload.tsx       # Image upload component
│   ├── insights/
│   │   ├── most-worn-chart.tsx    # Most worn items chart
│   │   ├── seasonal-chart.tsx     # Seasonal usage chart
│   │   └── outfit-frequency.tsx   # Outfit frequency chart
│   ├── layout/
│   │   ├── app-shell.tsx          # Main app wrapper
│   │   ├── nav-tabs.tsx           # Bottom navigation
│   │   └── header.tsx             # App header
│   └── shared/
│       ├── loading.tsx            # Loading states
│       ├── empty-state.tsx        # Empty states
│       ├── error-boundary.tsx     # Error handling
│       └── animated-container.tsx # Motion wrapper
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   ├── middleware.ts          # Auth middleware
│   │   └── storage.ts             # Storage helpers
│   ├── actions/
│   │   ├── clothing.ts            # Clothing CRUD actions
│   │   ├── calendar.ts            # Calendar actions
│   │   └── insights.ts            # Insights queries
│   ├── utils.ts                   # Utility functions
│   └── constants.ts               # App constants
├── types/
│   ├── database.ts                # Database types
│   ├── clothing.ts                # Clothing types
│   └── calendar.ts                # Calendar types
├── hooks/
│   ├── use-clothing.ts            # Clothing data hook
│   ├── use-calendar.ts            # Calendar data hook
│   └── use-drag-drop.ts           # Drag and drop hook
├── middleware.ts                  # Next.js middleware
├── components.json                # shadcn/ui config
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql # Database schema
```

## Server vs Client Component Strategy

### Server Components (Default)
- Page layouts and data fetching containers
- Static UI elements
- SEO-critical content
- Initial data loading

### Client Components ('use client')
- Interactive UI (forms, modals, drag-drop)
- Animation components
- Real-time updates
- User input handling

## Design Decisions & Tradeoffs

### 1. App Router over Pages Router
- **Pro**: Better server component support, streaming, layouts
- **Con**: Newer, some patterns still evolving
- **Decision**: Use App Router for modern patterns

### 2. Server Actions for Mutations
- **Pro**: Type-safe, no API routes needed, automatic revalidation
- **Con**: Limited to form-like interactions
- **Decision**: Use Server Actions for CRUD, API routes for complex ops

### 3. Optimistic Updates
- **Pro**: Instant feedback, better UX
- **Con**: Complexity in error handling
- **Decision**: Implement for add/edit/delete operations

### 4. Image Storage Strategy
- Store original images in Supabase Storage
- Generate thumbnails on-demand or use Supabase transforms
- Use blur placeholders for loading states

### 5. Drag and Drop
- Use native HTML5 drag-drop API with Motion.dev for animations
- Fallback to click-based assignment on mobile

## Extension Points

1. **AI Features**: Add background removal, auto-tagging with AI
2. **Social**: Share outfits, follow other users
3. **Weather Integration**: Suggest outfits based on weather
4. **E-commerce**: Link items to purchase URLs
5. **Analytics**: Advanced wear patterns, cost-per-wear
6. **Mobile App**: React Native with shared business logic
