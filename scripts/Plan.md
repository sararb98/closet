# Virtual Closet UX Audit and Implementation Plan

## 1. Executive Summary

### Highest-Impact Observations

- The product already has a restrained visual base, useful image-first inventory cards, and complete core paths for cataloging, outfit building, scheduling, and wear tracking. The strongest improvement opportunity is interaction density, not a visual redesign.
- On Outfits, the three toolbar controls consume three full rows at both 1010px and 390px. At 390px, the 350px-wide toolbar is 124px tall and pushes the first outfit grid to `y=314`.
- Desktop still renders the five-item mobile bottom navigation at 1440px and permanently reserves 96px of page space. This makes large screens feel less intentional and reduces useful content area.
- Calendar days meet a basic mobile touch target of 48px, but multi-outfit previews become too small to identify. Dense days need a readable day agenda, not further thumbnail compression.
- The outfit builder and calendar scheduler rely heavily on unlabeled visual tiles. This will become slower as a closet grows beyond the tested ten items.
- Saved-outfit deletion is immediate, unlike clothing deletion, which correctly uses a confirmation dialog. That inconsistency risks accidental loss of curated looks.
- Standard focus styling exists, but mobile icon-only Filter/Select controls, calendar previous/next buttons, and password-visibility buttons appear without accessible names. Audited dialogs also emit missing-description warnings.
- Insights shows useful data but starts with six equal-weight stats and does not turn findings such as "Never Worn" into an action.

### UX Direction

The UX direction should be a quieter planning workbench: one clear primary action per screen, compact task toolbars, and context-sensitive detail only when it helps a repeat action. Borrow the useful patterns of leading wardrobe products: visual catalog browsing, fast wear logging, category-led outfit assembly, and calendar views with a readable daily agenda, without copying their visual language.

### Evidence and Assumptions

Observed live at 1440px and 390px: Closet, item detail, Add, Outfits and builder, Calendar and scheduler, Insights, Profile, Settings, login, signup, and magic link. Source review covered reset password, confirmation, empty/loading/error states, and verified the behavior in `components/layout/nav-tabs.tsx`, `components/outfits/outfit-grid.tsx`, `components/closet/clothing-grid.tsx`, and `components/shared/empty-state.tsx`.

The data set was a populated test closet; large-closet performance, slow network, screen-reader behavior, upload completion, and real user frequency are assumptions rather than observed evidence.

## 2. Prioritized Recommendations

| Priority | Screen/workflow | Current problem | Recommended change | Why it improves UX | Desktop/mobile behavior | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| P0 (Done) | Saved outfits | Trash deletes immediately with no recovery. | Add confirmation, or soft-delete plus a toast with a real Undo action. | Prevents loss of manually curated outfits. | Same protection on both; mobile confirmation is a bottom sheet. | Medium |
| P1 (Done) | App shell/navigation | Bottom five-tab navigation persists through 1440px. | Use bottom nav below 768px only; add compact labeled header navigation from 768px upward and remove excess bottom padding. | Restores usable vertical space and makes desktop orientation clearer. | Bottom tabs on phones; inline header tabs on tablet/desktop. | Medium |
| P1 (Done) | Outfits toolbar | Create, season, and use controls stack into three rows. | Move the toolbar to the header's top-right; use fixed compact controls. Exact behavior follows below. | Brings saved looks above the fold and aligns the primary action with filters. | One row at 768px+; two-row grid on phones. | Small |
| P1 (Done) | Closet controls | Mobile search shrinks to 86px; Archive is a 32px icon; mobile Filter and Select lose visible labels. | Make search a full first row; put Filter, Sort, Select in a second row; make icon targets at least 44px and add `aria-label`s/tooltips. | Search remains usable and repeated inventory actions stay discoverable. | Keep current single desktop row; explicitly reflow on mobile. | Small |
| P1 (Done) | Add item/image/color | The empty photo target dominates the first viewport; "Add New Item" repeats; 21 colors appear at once. | Use one page title, cap the empty upload target around 240px, then show Name/Type beside or immediately below it; place Color and optional fields in progressive sections. | Speeds catalog entry while keeping precision available. | Two-column essentials at desktop; linear sections on mobile. | Medium |
| P1 (Done) | Outfit builder/scheduler | Image-only selection becomes hard to scan; no category/search path. | Add search, type chips, favorites/recent filters, and a small item-name/type label under or on hover/focus for each tile. | Cuts recognition time in a larger closet. | Compact filter row desktop; filter drawer or chips mobile. | Medium |
| P1 (Done) | Calendar | Multi-outfit days show tiny 2x2 images and "+N," without readable identity. | Retain month grid, but reveal a selected-day agenda with outfit name, occasion, thumbnail, and actions; default to this agenda below the grid on mobile. | Makes planning and marking worn comprehensible at a glance. | Side panel at desktop; sheet/inline agenda on mobile. | Large |
| P1 (Done) | Dialogs, forms, feedback | Three dialogs emit missing-description warnings; auth/add validation is mostly toast-based; saves lack consistent progress wording. | Add `DialogDescription`, inline field errors with `aria-live`, `Saving...` labels, and preserve focus when dialogs close. | Improves keyboard/screen-reader use and reduces uncertainty. | Same semantics; 44px minimum mobile controls. | Small |
| P1 (Done) | Error and empty states | Shared `ErrorBoundary` is not mounted and no route `error.tsx` was found; search empty state offers no clear reset. | Add route-level errors with retry and human-readable recovery; give search-empty a "Clear filters" action. Avoid showing raw technical errors. | A failed or filtered-out workflow remains recoverable. | Same intent; mobile buttons full-width when needed. | Medium |
| P2 (Done) | Insights | Six equal stats precede actionable insight; chart sizing warnings occur during render. | Lead with 1-2 action cards, such as "4 items never worn: review," then secondary stats; fix chart container measurement. | Turns analytics into wardrobe decisions rather than a dashboard. | Two key actions first on mobile; charts stack below. | Medium |
| P2 (Done) | Profile/settings | Profile is mostly static metadata; Settings shows inactive "coming soon" rows. | Remove unavailable rows or make them disabled with timing; add actual theme preference and notification/reminder settings only when functional. | Avoids dead-end interactions and gives the screen a clear purpose. | Same content, comfortably constrained width. | Small |

### Outfits Toolbar Specification

- At `>=768px`: title/subtitle left, toolbar right-aligned on the same header band. Use `Create outfit` at `40px` high and roughly `132px` wide; Season select `144px`; Occasion select `160px`; `8px` gaps. Keep all three horizontally aligned with `ml-auto`.
- At `640-767px`: keep the same single-row toolbar beneath the title, right-aligned or full-width only when necessary.
- Below `640px`: use a two-row grid. `Create outfit` spans both columns at `44px` high; Season and Occasion each occupy one equal-width `44px` control on the second row. At the tested 390px width, each filter receives about `171px`, stays readable, and reduces the stack from three controls to two compact rows.
- Rename "Use" to "Occasion" in builders and filters. The current wording is terse but less immediately recognizable.

## 3. Screen-by-Screen Review

### App Shell and Navigation

Keep the clean sticky header, but give the avatar an "Open account menu" label. Replace persistent desktop bottom tabs with inline navigation; keep the phone bottom bar because its labels make primary destinations reachable.

### Closet Inventory

The desktop toolbar is efficient. On mobile, prioritize search width, give hidden-label controls accessible names, and add a visible result count such as "10 items" or "3 matching" near filters.

### Item Detail, Editing, and Archive

The detail modal presents wear count, last worn, seasons, tags, and edit well. Add a dialog description, a visible "Schedule" or "Mark worn today" action, and maintain the existing confirmed clothing-delete flow.

### Add Item and Color Selection

Photo, name, and type should form the first task group. Keep the eyedropper, but provide a keyboard-accessible hex input and describe the resulting color category; collapse Brand, price, notes, archive, and favorite under "More details."

### Saved Outfits

Give each saved outfit a name or concise metadata that remains visible in the card footer; image mosaics alone do not support fast recall. Persist season/occasion filters in the URL so a repeated filtered view can be bookmarked or retained after refresh.

### Outfit Builder

Keep the fixed header/footer and selected-item count. Add categories/search, item labels, a visible saving state, and an `aria-live` update for selections; currently the image grid has no natural scan order beyond visual memory.

### Calendar and Scheduling

Add accessible names to month arrows. The scheduler should label scheduled outfit previews, distinguish saved versus custom variations more strongly, and make "Mark worn" create clear success/undo feedback.

### Insights

"Never Worn" should link to a pre-filtered Closet view; "Planned Outfits" should link to Calendar. De-emphasize low-value aggregate cards and make chart legends/tap targets legible rather than relying on color alone.

### Profile and Settings

The centered account card is calm but sparse. Keep Profile read-only; make Settings actionable or shorter, rather than presenting unavailable preferences as normal rows.

### Authentication, Empty, Loading, and Error States

Login, signup, and magic link are focused and work well on mobile. Add labels to password visibility toggles, inline submission errors, password requirements before submit, route-level error recovery, and a clear-filters action for empty search results. Loading skeletons match the page shapes well.

## 4. Missing Features

### Must-Have for a Useful Wardrobe Planner

| Feature | User problem and interaction concept | Expected value | Complexity | Dependencies or risks |
| --- | --- | --- | --- | --- |
| (Done) Quick wear log | People wear unplanned outfits; add "Worn today" from item detail and a daily outfit log with Undo. | Keeps insights accurate. | Medium | Date model and duplicate-wear rules. |
|(Won't do) Day/week agenda | A month cell cannot explain a planned day; show the next 7 days and selected-day outfit list. | Makes planning actionable daily. | Medium | Calendar layout and scheduling queries. |
| (Done) Scalable outfit browsing | Image-only tiles fail with 50+ items; search and filter by type, color, season, favorite, and recently worn. | Faster outfit creation. | Medium | Client filtering first, indexed query later. |

### High-Value Differentiators

| Feature | User problem and interaction concept | Expected value | Complexity | Dependencies or risks |
| --- | --- | --- | --- | --- |
| (Done) Laundry/availability state | Recently worn or unavailable garments get selected again; mark items clean, in laundry, or packed. | More realistic recommendations. | Medium | Item-state model and calendar rules. |
| (Done) Weather-aware suggestions | Choosing an outfit requires separate weather checking; show current local conditions and clean season-matched suggestions. | Strong planning utility. | Medium | Location consent, weather API, privacy. |
| (Done) Capsule/trip planner | Trips require a temporary subset and packing checklist; create a dated capsule with a packing checklist linked to closet items. | Extends calendar into planning. | Large | New model and cross-screen flows. |
| (Done) Cost-per-wear and gaps | Purchase price exists but does not guide decisions; calculate cost-per-wear and flag overrepresented categories. | Practical buying and decluttering insight. | Medium | Currency/data quality assumptions. |

### Nice-to-Have and Future Ideas

| Feature | User problem and interaction concept | Expected value | Complexity | Dependencies or risks |
| --- | --- | --- | --- | --- |
| Reminders/calendar sync | Plans remain inside the app; optionally remind or export selected outfits. | Improves follow-through. | Medium | Notification permission and external calendar APIs. |
| Private share/export | Users may want a packing list or outfit board; export selected looks as images/PDF. | Useful without making social features core. | Medium | Image generation and privacy controls. |

## 5. Recommended Implementation Sequence

### Two-Week Quick-Win Pass

Implement the responsive Outfits toolbar, desktop navigation switch, 44px mobile targets, accessible labels/descriptions, outfit-delete confirmation/undo, inline validation, and a shorter progressive Add flow. Fix chart sizing warnings in the same pass.

### Next-Phase UX Improvement Pass

Build URL-persisted Closet filters and actionable Insight links.

### Longer-Term Product Bets

Add availability/laundry status, weather-aware planning, trip capsules, cost-per-wear, and optional reminders or calendar sync.
