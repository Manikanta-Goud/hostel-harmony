-- DATA TRANSFER SCRIPT
-- Run this in your Supabase SQL Editor to move all existing data to srinivas@gmail.com

-- 1. Update all hostels to be owned by the new email
UPDATE hostels 
SET owner_id = 'srinivas@gmail.com' 
WHERE owner_id IN ('1', 'bulk-import', 'default-owner', 'admin@hostel.com');

-- Now srinivas@gmail.com will see all the existing hostels, 
-- including "Sri Subramanya Swami" details.
