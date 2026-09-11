ALTER TABLE outfits DROP COLUMN name;
ALTER TABLE calendar_outfit_instances DROP COLUMN name;

COMMENT ON TABLE outfits IS 'Reusable combinations of clothing items.';
COMMENT ON TABLE calendar_outfit_instances IS 'Day-specific clothing plans, optionally based on a reusable outfit.';