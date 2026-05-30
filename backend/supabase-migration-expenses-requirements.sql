-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'utilities', 'staff', 'supplies', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create requirements table
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_hostel_id ON expenses(hostel_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_requirements_hostel_id ON requirements(hostel_id);
CREATE INDEX IF NOT EXISTS idx_requirements_date ON requirements(date);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view expenses for their hostels"
  ON expenses FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses for their hostels"
  ON expenses FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for their hostels"
  ON expenses FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for their hostels"
  ON expenses FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

-- Create policies for requirements
CREATE POLICY "Users can view requirements for their hostels"
  ON requirements FOR SELECT
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert requirements for their hostels"
  ON requirements FOR INSERT
  WITH CHECK (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update requirements for their hostels"
  ON requirements FOR UPDATE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete requirements for their hostels"
  ON requirements FOR DELETE
  USING (
    hostel_id IN (
      SELECT id FROM hostels WHERE owner_id = auth.uid()
    )
  );
