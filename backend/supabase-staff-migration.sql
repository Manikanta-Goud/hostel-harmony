-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  area TEXT,
  role TEXT,
  monthly_salary INTEGER NOT NULL,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Salary Payments Table
CREATE TABLE IF NOT EXISTS staff_salaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'due', 'pending')),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, month)
);

-- Utilities Table (replacing requirements)
CREATE TABLE IF NOT EXISTS utilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  supplies TEXT NOT NULL,
  amount INTEGER NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Expenses Table if it doesn't exist
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update expenses table to remove 'maintenance' and add new structure
-- Drop the old check constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Add new check constraint without maintenance
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN ('utilities', 'staff', 'supplies', 'other'));

-- Add trigger for expenses if it doesn't exist
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_hostel_id ON staff(hostel_id);
CREATE INDEX IF NOT EXISTS idx_staff_salaries_staff_id ON staff_salaries(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_salaries_month ON staff_salaries(month);
CREATE INDEX IF NOT EXISTS idx_utilities_hostel_id ON utilities(hostel_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_hostel_id ON suppliers(hostel_id);
CREATE INDEX IF NOT EXISTS idx_expenses_hostel_id ON expenses(hostel_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Enable Row Level Security (RLS)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now)
CREATE POLICY "Users can view staff" ON staff FOR ALL USING (true);
CREATE POLICY "Users can view staff_salaries" ON staff_salaries FOR ALL USING (true);
CREATE POLICY "Users can view utilities" ON utilities FOR ALL USING (true);
CREATE POLICY "Users can view suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Users can view expenses" ON expenses FOR ALL USING (true);

-- Triggers to auto-update updated_at
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_salaries_updated_at BEFORE UPDATE ON staff_salaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utilities_updated_at BEFORE UPDATE ON utilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
