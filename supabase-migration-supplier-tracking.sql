-- Add new columns to suppliers table to support per-unit pricing (water cans tracking)
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS supply_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS per_unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS current_month_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS month TEXT;

-- Create supplier_payments table to track supplier payment history
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  unit_count INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  paid_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hostel_rent_payments table to track monthly hostel rent
CREATE TABLE IF NOT EXISTS hostel_rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hostel_id, month) -- One rent record per hostel per month
);

-- Enable RLS for new tables
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rent_payments ENABLE ROW LEVEL SECURITY;

-- Policies for supplier_payments
CREATE POLICY "Users can view supplier_payments for their hostels"
  ON supplier_payments FOR SELECT
  USING (
    supplier_id IN (
      SELECT s.id FROM suppliers s
      JOIN hostels h ON s.hostel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert supplier_payments for their hostels"
  ON supplier_payments FOR INSERT
  WITH CHECK (
    supplier_id IN (
      SELECT s.id FROM suppliers s
      JOIN hostels h ON s.hostel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update supplier_payments for their hostels"
  ON supplier_payments FOR UPDATE
  USING (
    supplier_id IN (
      SELECT s.id FROM suppliers s
      JOIN hostels h ON s.hostel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete supplier_payments for their hostels"
  ON supplier_payments FOR DELETE
  USING (
    supplier_id IN (
      SELECT s.id FROM suppliers s
      JOIN hostels h ON s.hostel_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- Policies for hostel_rent_payments
CREATE POLICY "Users can view their hostel rent payments"
  ON hostel_rent_payments FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their hostel rent payments"
  ON hostel_rent_payments FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their hostel rent payments"
  ON hostel_rent_payments FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their hostel rent payments"
  ON hostel_rent_payments FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels 
      WHERE owner_id = auth.uid()
    )
  );
