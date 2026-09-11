CREATE TABLE calendar_outfit_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    source_outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50)[] DEFAULT '{}',
    occasion VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'worn', 'skipped')),
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE calendar_outfit_instance_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    calendar_outfit_instance_id UUID NOT NULL REFERENCES calendar_outfit_instances(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(calendar_outfit_instance_id, item_id)
);

CREATE INDEX idx_calendar_outfit_instances_user_date
    ON calendar_outfit_instances(user_id, date);
CREATE INDEX idx_calendar_outfit_instance_items_instance
    ON calendar_outfit_instance_items(calendar_outfit_instance_id);
CREATE INDEX idx_calendar_outfit_instance_items_item
    ON calendar_outfit_instance_items(item_id);

ALTER TABLE calendar_outfit_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_outfit_instance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled outfits"
    ON calendar_outfit_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled outfits"
    ON calendar_outfit_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled outfits"
    ON calendar_outfit_instances FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled outfits"
    ON calendar_outfit_instances FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled outfit items"
    ON calendar_outfit_instance_items FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calendar_outfit_instances
            WHERE calendar_outfit_instances.id = calendar_outfit_instance_items.calendar_outfit_instance_id
            AND calendar_outfit_instances.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own scheduled outfit items"
    ON calendar_outfit_instance_items FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM calendar_outfit_instances
            WHERE calendar_outfit_instances.id = calendar_outfit_instance_items.calendar_outfit_instance_id
            AND calendar_outfit_instances.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own scheduled outfit items"
    ON calendar_outfit_instance_items FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM calendar_outfit_instances
            WHERE calendar_outfit_instances.id = calendar_outfit_instance_items.calendar_outfit_instance_id
            AND calendar_outfit_instances.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM calendar_outfit_instances
            WHERE calendar_outfit_instances.id = calendar_outfit_instance_items.calendar_outfit_instance_id
            AND calendar_outfit_instances.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own scheduled outfit items"
    ON calendar_outfit_instance_items FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM calendar_outfit_instances
            WHERE calendar_outfit_instances.id = calendar_outfit_instance_items.calendar_outfit_instance_id
            AND calendar_outfit_instances.user_id = auth.uid()
        )
    );

CREATE TRIGGER update_calendar_outfit_instances_updated_at
    BEFORE UPDATE ON calendar_outfit_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_scheduled_outfit_wear_counts()
RETURNS TRIGGER AS $$
DECLARE
    affected_instance_id UUID;
    affected_date DATE;
    affected_status VARCHAR(20);
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = NEW.status THEN
            RETURN NEW;
        END IF;
        affected_instance_id := NEW.id;
        affected_date := NEW.date;
        affected_status := NEW.status;

        IF OLD.status = 'worn' THEN
            UPDATE clothing_items
            SET wear_count = GREATEST(wear_count - 1, 0)
            WHERE id IN (
                SELECT item_id FROM calendar_outfit_instance_items
                WHERE calendar_outfit_instance_id = affected_instance_id
            );
        END IF;

        IF affected_status = 'worn' THEN
            UPDATE clothing_items
            SET wear_count = wear_count + 1,
                last_worn_date = GREATEST(last_worn_date, affected_date)
            WHERE id IN (
                SELECT item_id FROM calendar_outfit_instance_items
                WHERE calendar_outfit_instance_id = affected_instance_id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_outfit_wear_counts_trigger
    AFTER UPDATE OF status ON calendar_outfit_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_outfit_wear_counts();

INSERT INTO calendar_outfit_instances (user_id, date, name, status, position, created_at, updated_at)
SELECT
    user_id,
    date,
    'Outfit for ' || TO_CHAR(date, 'Mon FMDD, YYYY'),
    'worn',
    0,
    MIN(created_at),
    MAX(updated_at)
FROM calendar_outfits
GROUP BY user_id, date;

INSERT INTO calendar_outfit_instance_items (calendar_outfit_instance_id, item_id, position, created_at)
SELECT
    instance.id,
    legacy.item_id,
    legacy.position,
    legacy.created_at
FROM calendar_outfits AS legacy
JOIN calendar_outfit_instances AS instance
    ON instance.user_id = legacy.user_id
    AND instance.date = legacy.date
    AND instance.status = 'worn';