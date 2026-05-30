-- Simple migration for supplier tracking - handles existing schema
-- Add new columns to suppliers table to support per-unit pricing (water cans tracking)
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS supply_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS per_unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS current_month_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS month TEXT;
