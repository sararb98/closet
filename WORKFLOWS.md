# Virtual Closet Workflows

This guide captures the current user-facing workflows and the checks required when changing them. It is the source of truth for future implementation and manual browser tests.

## Shared Rules

- Clothing and outfit imagery is the primary identifier. Do not render item or outfit names as visible card labels.
- Names remain in data, image alt text, and aria labels so controls are accessible and saved records can be identified by actions.
- Saved outfits are reusable templates. Calendar entries are independent snapshots, so a special-day adjustment never modifies a saved outfit.
- Calendar schedules begin as `planned`. Only a `worn` entry affects item wear counts and insights.

## Authentication

1. A visitor can sign up, confirm their email, and sign in with email/password or a magic link.
2. A signed-in user can request and complete a password reset.
3. Protected pages redirect unauthenticated visitors to login.

Check: authentication state survives a page refresh and no protected data is exposed to another user.

## Clothing Items

1. Add an item with a supported image, required name/type fields, and optional brand, seasons, tags, and notes.
2. Sample a precise image color with the eyedropper or choose a color category manually.
3. Edit item metadata and image information from the item form/modal.
4. Favorite, archive, restore, and delete items. Archived items are hidden from normal closet, calendar selection, and insights.
5. Filter the closet by type, color, season, tag, and favorites; use multi-select for bulk archive/restore.

Check: upload, edit, archive, and restore one item; ensure it appears only in the appropriate view and does not leak into calendar candidates while archived.

## Saved Outfits

1. A saved outfit is a named reusable combination of two or more clothing items, with optional season and occasion metadata.
2. The Outfits page presents image-only two-by-two collages, with season/occasion badges and a delete control.
3. Saved outfit names are not visible in cards but remain available to assistive technology and destructive-action labels.

Check: verify collage slot ordering (top, accessories, bottoms, shoes), responsive card sizing, filter behavior, and deletion recovery on server failure.

## Calendar: Schedule Saved Outfits

1. Open a day and use **My outfits**.
2. Select any number of compact image-only saved-outfit tiles by clicking anywhere on a tile.
3. Choose the fixed **Add selected** footer action. Each chosen template creates a separate scheduled snapshot for that date.
4. The day cell shows up to two outfit collages and then `+N`; opening the day displays all scheduled entries.

Check: add two saved outfits to one empty day, refresh the page, confirm both persist as separate cards, and verify the day cell shows two collages. With enough saved outfits to overflow, verify only the picker content scrolls while the header, tabs, and footer action remain visible.

## Calendar: Custom Variation

1. Open a day and use **Custom variation**.
2. Select **Start from scratch** or select one compact image-only saved-outfit tile as a source.
3. A selected source preselects its items. Add or remove item images using their checkboxes.
4. Choose the fixed **Add variation** footer action to create an independent calendar snapshot.
5. Entries based on a saved outfit show the visible source-link indicator but never change the saved template.

Check: select a source outfit, remove one item, add the variation, reload, and confirm the calendar copy has the changed item set while the saved outfit retains its original items.

## Calendar: Planned and Worn States

1. New scheduled entries are `planned` and show the mark-worn icon.
2. Marking an entry worn removes that icon and increments each included item's wear count once.
3. Removing a planned or worn entry removes the snapshot. Removing a worn entry reverses its wear-count contribution and recalculates the item's last-worn date.

Check: compare an included item's wear count before marking worn, after marking worn, and after removing the worn entry. It must return to the original count.

## Insights

1. Closet totals and distributions exclude archived items.
2. Monthly activity counts non-archived items from scheduled entries marked `worn` only.
3. Color distribution groups by the bounded `color` category, while `color_hex` remains display-only.

Check: a planned calendar entry must not change insights; mark it worn and confirm activity updates after refresh.