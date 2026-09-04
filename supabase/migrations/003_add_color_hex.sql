-- ============================================================================
-- ADD EXACT COLOR (HEX) FIELD TO CLOTHING ITEMS
-- ============================================================================
-- `color` continues to store the aggregation-friendly category (one of the
-- fixed swatches in types/clothing.ts COLORS), used for filtering/analytics.
-- `color_hex` stores the exact color sampled from the item's photo via the
-- eyedropper tool (e.g. '#7a1f2b'), used for accurate display only.
-- ============================================================================

ALTER TABLE clothing_items
    ADD COLUMN IF NOT EXISTS color_hex VARCHAR(7)
        CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9a-fA-F]{6}$');

COMMENT ON COLUMN clothing_items.color IS 'Color category for filtering/analytics (nearest perceptual match to the COLORS palette centroids)';
COMMENT ON COLUMN clothing_items.color_hex IS 'Exact color sampled from the item photo via the eyedropper tool, e.g. #7a1f2b';
