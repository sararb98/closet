ALTER TABLE clothing_items
    ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) NOT NULL DEFAULT 'clean'
    CHECK (availability_status IN ('clean', 'laundry', 'packed'));

CREATE INDEX IF NOT EXISTS idx_clothing_items_availability
    ON clothing_items(user_id, availability_status)
    WHERE archived = FALSE;

CREATE TABLE capsules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

CREATE TABLE capsule_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(capsule_id, item_id)
);

CREATE INDEX idx_capsules_user_dates ON capsules(user_id, start_date, end_date);
CREATE INDEX idx_capsule_items_capsule ON capsule_items(capsule_id);

ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own capsules" ON capsules
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own capsule items" ON capsule_items
    FOR ALL USING (EXISTS (SELECT 1 FROM capsules WHERE capsules.id = capsule_items.capsule_id AND capsules.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM capsules WHERE capsules.id = capsule_items.capsule_id AND capsules.user_id = auth.uid()));

CREATE TRIGGER update_capsules_updated_at
    BEFORE UPDATE ON capsules FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();