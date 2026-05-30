-- Add occupancy_type to rooms if it doesn't exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS occupancy_type TEXT DEFAULT 'student';

-- Update existing rooms to have a default if null
UPDATE rooms SET occupancy_type = 'student' WHERE occupancy_type IS NULL;
