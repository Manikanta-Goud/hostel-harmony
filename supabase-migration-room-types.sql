-- Add room_type and wing/section columns to rooms table

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'room' CHECK (room_type IN ('hall', 'room'));

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS wing TEXT;

-- Update existing rooms to have default values
UPDATE rooms SET room_type = 'room' WHERE room_type IS NULL;
