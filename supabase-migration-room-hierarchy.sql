-- Add parent_room_id to support hierarchical room structure
-- and bathroom field for rent calculation

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS parent_room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS has_attached_bathroom BOOLEAN DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_parent_room_id ON rooms(parent_room_id);

-- Update existing rooms
UPDATE rooms SET has_attached_bathroom = false WHERE has_attached_bathroom IS NULL;
