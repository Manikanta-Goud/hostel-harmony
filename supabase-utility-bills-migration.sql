-- Migration for Utility Bills Tracking (Hostel Rent, Electricity, Gas)

-- Create hostel_rent_payments table
CREATE TABLE IF NOT EXISTS hostel_rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  month TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create electricity_bills table
CREATE TABLE IF NOT EXISTS electricity_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  units INTEGER,
  bill_date DATE NOT NULL,
  month TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gas_bills table
CREATE TABLE IF NOT EXISTS gas_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  units INTEGER,
  bill_date DATE NOT NULL,
  month TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hostel_rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hostel_rent_payments
CREATE POLICY "Users can view their hostel rent payments"
  ON hostel_rent_payments FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their hostel rent payments"
  ON hostel_rent_payments FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their hostel rent payments"
  ON hostel_rent_payments FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their hostel rent payments"
  ON hostel_rent_payments FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for electricity_bills
CREATE POLICY "Users can view their electricity bills"
  ON electricity_bills FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their electricity bills"
  ON electricity_bills FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their electricity bills"
  ON electricity_bills FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their electricity bills"
  ON electricity_bills FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for gas_bills
CREATE POLICY "Users can view their gas bills"
  ON gas_bills FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their gas bills"
  ON gas_bills FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their gas bills"
  ON gas_bills FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their gas bills"
  ON gas_bills FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hostel_rent_payments_hostel_month 
  ON hostel_rent_payments(hostel_id, month);

CREATE INDEX IF NOT EXISTS idx_electricity_bills_hostel_month 
  ON electricity_bills(hostel_id, month);

CREATE INDEX IF NOT EXISTS idx_gas_bills_hostel_month 
  ON gas_bills(hostel_id, month);
