-- ============================================================================
-- VIRTUAL CLOSET DATABASE SCHEMA
-- ============================================================================
-- Run this migration in your Supabase SQL Editor or via CLI
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Clothing Items Table
CREATE TABLE IF NOT EXISTS clothing_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    type VARCHAR(50) NOT NULL,
    season VARCHAR(50)[] DEFAULT '{}',
    color VARCHAR(50),
    brand VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    wear_count INTEGER DEFAULT 0,
    last_worn_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clothing Tags Table (for custom user tags)
CREATE TABLE IF NOT EXISTS clothing_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Item Tags Junction Table
CREATE TABLE IF NOT EXISTS item_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES clothing_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, tag_id)
);

-- Calendar Outfits Table (items assigned to dates)
CREATE TABLE IF NOT EXISTS calendar_outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, item_id)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    default_view VARCHAR(20) DEFAULT 'grid',
    theme VARCHAR(20) DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Clothing items indexes for filtering
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_type ON clothing_items(type);
CREATE INDEX IF NOT EXISTS idx_clothing_items_color ON clothing_items(color);
CREATE INDEX IF NOT EXISTS idx_clothing_items_season ON clothing_items USING GIN(season);
CREATE INDEX IF NOT EXISTS idx_clothing_items_wear_count ON clothing_items(wear_count DESC);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created_at ON clothing_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clothing_items_is_favorite ON clothing_items(is_favorite) WHERE is_favorite = TRUE;

-- Calendar outfits indexes
CREATE INDEX IF NOT EXISTS idx_calendar_outfits_user_id ON calendar_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_outfits_date ON calendar_outfits(date);
CREATE INDEX IF NOT EXISTS idx_calendar_outfits_user_date ON calendar_outfits(user_id, date);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_clothing_tags_user_id ON clothing_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Clothing Items Policies
CREATE POLICY "Users can view own clothing items"
    ON clothing_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clothing items"
    ON clothing_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothing items"
    ON clothing_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothing items"
    ON clothing_items FOR DELETE
    USING (auth.uid() = user_id);

-- Clothing Tags Policies
CREATE POLICY "Users can view own tags"
    ON clothing_tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
    ON clothing_tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
    ON clothing_tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
    ON clothing_tags FOR DELETE
    USING (auth.uid() = user_id);

-- Item Tags Policies (join table)
CREATE POLICY "Users can view own item tags"
    ON item_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own item tags"
    ON item_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own item tags"
    ON item_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

-- Calendar Outfits Policies
CREATE POLICY "Users can view own calendar outfits"
    ON calendar_outfits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar outfits"
    ON calendar_outfits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar outfits"
    ON calendar_outfits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar outfits"
    ON calendar_outfits FOR DELETE
    USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_clothing_items_updated_at
    BEFORE UPDATE ON clothing_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_outfits_updated_at
    BEFORE UPDATE ON calendar_outfits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment wear count when outfit is assigned
CREATE OR REPLACE FUNCTION increment_wear_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clothing_items
    SET wear_count = wear_count + 1,
        last_worn_date = NEW.date
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_wear_on_calendar_assignment
    AFTER INSERT ON calendar_outfits
    FOR EACH ROW
    EXECUTE FUNCTION increment_wear_count();

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'clothing-images',
    'clothing-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for clothing images
CREATE POLICY "Users can upload own images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'clothing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'clothing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view public images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'clothing-images');

CREATE POLICY "Users can update own images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'clothing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'clothing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- SAMPLE DATA TYPES (for reference)
-- ============================================================================

COMMENT ON TABLE clothing_items IS 'Main table storing all clothing items';
COMMENT ON COLUMN clothing_items.type IS 'Values: shirt, t-shirt, blouse, sweater, jacket, coat, pants, jeans, shorts, skirt, dress, shoes, sneakers, boots, sandals, accessories, bag, hat, jewelry, other';
COMMENT ON COLUMN clothing_items.season IS 'Array of: spring, summer, fall, winter, all-season';
COMMENT ON COLUMN clothing_items.color IS 'Primary color: black, white, gray, navy, blue, red, pink, purple, green, yellow, orange, brown, beige, multi';
