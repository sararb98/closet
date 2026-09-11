CREATE OR REPLACE FUNCTION update_scheduled_outfit_wear_counts()
RETURNS TRIGGER AS $$
DECLARE
    affected_instance_id UUID;
    previous_status VARCHAR(20);
    next_status VARCHAR(20);
BEGIN
    affected_instance_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
    previous_status := CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE OLD.status END;
    next_status := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NEW.status END;

    IF TG_OP = 'UPDATE' AND previous_status = next_status THEN
        RETURN NEW;
    END IF;

    IF previous_status = 'worn' THEN
        UPDATE clothing_items
        SET wear_count = GREATEST(wear_count - 1, 0)
        WHERE id IN (
            SELECT item_id FROM calendar_outfit_instance_items
            WHERE calendar_outfit_instance_id = affected_instance_id
        );
    END IF;

    IF next_status = 'worn' THEN
        UPDATE clothing_items
        SET wear_count = wear_count + 1
        WHERE id IN (
            SELECT item_id FROM calendar_outfit_instance_items
            WHERE calendar_outfit_instance_id = affected_instance_id
        );
    END IF;

    UPDATE clothing_items AS item
    SET last_worn_date = (
        SELECT MAX(instance.date)
        FROM calendar_outfit_instance_items AS scheduled_item
        JOIN calendar_outfit_instances AS instance
            ON instance.id = scheduled_item.calendar_outfit_instance_id
        WHERE scheduled_item.item_id = item.id
        AND instance.status = 'worn'
    )
    WHERE item.id IN (
        SELECT item_id FROM calendar_outfit_instance_items
        WHERE calendar_outfit_instance_id = affected_instance_id
    );

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER update_scheduled_outfit_wear_counts_trigger ON calendar_outfit_instances;

CREATE TRIGGER update_scheduled_outfit_wear_counts_trigger
    AFTER UPDATE OF status OR DELETE ON calendar_outfit_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_outfit_wear_counts();