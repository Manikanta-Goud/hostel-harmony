-- Add property type tracking for Hostels
ALTER TABLE hostels
ADD COLUMN property_type TEXT DEFAULT 'owned',
ADD COLUMN rent_amount NUMERIC DEFAULT 0;

-- Optionally, add a check constraint on property_type
ALTER TABLE hostels
ADD CONSTRAINT check_property_type CHECK (property_type IN ('owned', 'rented'));
