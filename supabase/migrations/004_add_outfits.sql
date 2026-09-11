CREATE TABLE outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50)[] DEFAULT '{}',
    occasion VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE outfit_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, item_id)
);

CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_user_occasion ON outfits(user_id, occasion);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item_id ON outfit_items(item_id);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits"
    ON outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits"
    ON outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits"
    ON outfits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits"
    ON outfits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own outfit items"
    ON outfit_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
    );
CREATE POLICY "Users can insert own outfit items"
    ON outfit_items FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
    );
CREATE POLICY "Users can update own outfit items"
    ON outfit_items FOR UPDATE USING (
        EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
    );
CREATE POLICY "Users can delete own outfit items"
    ON outfit_items FOR DELETE USING (
        EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
    );

CREATE TRIGGER update_outfits_updated_at
    BEFORE UPDATE ON outfits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE outfits IS 'Reusable named outfits assembled from clothing items';
COMMENT ON COLUMN outfits.occasion IS 'Use category: event, formal, casual, office, date, travel, sport, or other';