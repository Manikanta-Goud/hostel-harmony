-- Migration to add 'partial' to payment status check constraint
-- and add 'remaining_amount' and 'next_payment_date' columns

-- 1. Drop existing CHECK constraint on payment status
-- Note: We need to find the name of the constraint first or try to drop it if we know the name.
-- By default postgres names it payments_status_check
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Add the new CHECK constraint including 'partial'
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('paid', 'due', 'overdue', 'partial'));

-- 3. Add new columns for partial payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS remaining_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- 4. Fix any existing 'pending' status to 'due' if any exist (from old schema)
UPDATE payments SET status = 'due' WHERE status = 'pending';
