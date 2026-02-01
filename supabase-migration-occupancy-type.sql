-- Add occupancy_type column to rooms table
-- This allows distinguishing between rooms for students (shared occupancy) vs family rooms

ALTER TABLE rooms
ADD COLUMN occupancy_type TEXT NOT NULL DEFAULT 'students'
CHECK (occupancy_type IN ('students', 'family'));

-- Update existing rows to have the default value
UPDATE rooms
SET occupancy_type = 'students'
WHERE occupancy_type IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN rooms.occupancy_type IS 'Specifies whether the room is for students (shared occupancy) or family (single family unit)';
