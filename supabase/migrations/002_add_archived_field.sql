-- ============================================================================
-- ADD ARCHIVED FIELD TO CLOTHING ITEMS
-- ============================================================================
-- Adds an `archived` flag to clothing_items so users can hide items from the
-- main closet view without deleting them. Archived items are excluded from
-- getClothingItems() and surfaced separately via getArchivedItems().
-- ============================================================================

ALTER TABLE clothing_items
    ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial index to speed up filtering archived items (mirrors is_favorite pattern)
CREATE INDEX IF NOT EXISTS idx_clothing_items_archived ON clothing_items(archived) WHERE archived = TRUE;
