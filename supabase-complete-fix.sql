-- COMPLETE DATABASE FIX - Run this once in Supabase SQL Editor

-- 1. Create all tables if missing
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  monthly_rent INTEGER NOT NULL,
  room_type TEXT,
  occupancy_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monthly_rent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add all new columns
ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT 'monthly';
ALTER TABLE students ADD COLUMN IF NOT EXISTS custom_days INTEGER;
ALTER TABLE students ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMP WITH TIME ZONE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhar_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS work_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;

-- 3. Update payments for partial payment support
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('paid', 'due', 'overdue', 'partial'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS remaining_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- 4. Enable RLS
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (allow all operations)
DROP POLICY IF EXISTS "Enable all for hostels" ON hostels;
CREATE POLICY "Enable all for hostels" ON hostels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for floors" ON floors;
CREATE POLICY "Enable all for floors" ON floors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for rooms" ON rooms;
CREATE POLICY "Enable all for rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for students" ON students;
CREATE POLICY "Enable all for students" ON students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for payments" ON payments;
CREATE POLICY "Enable all for payments" ON payments FOR ALL USING (true) WITH CHECK (true);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_floors_hostel_id ON floors(hostel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_students_room_id ON students(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(month);
