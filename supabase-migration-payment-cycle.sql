-- Add payment cycle fields to students table

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT 'monthly' CHECK (payment_cycle IN ('monthly', 'custom'));

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS custom_days INTEGER;

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMP WITH TIME ZONE;

-- Update existing students to have next payment due date (1 month from join date)
UPDATE students 
SET next_payment_due = join_date + INTERVAL '1 month'
WHERE next_payment_due IS NULL;

COMMENT ON COLUMN students.payment_cycle IS 'Payment cycle type: monthly (30 days) or custom';
COMMENT ON COLUMN students.custom_days IS 'Number of days for custom payment cycle';
COMMENT ON COLUMN students.next_payment_due IS 'Next payment due date calculated from join date and payment cycle';
