-- Clean up existing tables (if any) and recreate them
-- Run this if you get "relation already exists" errors

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;

-- Drop existing function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Now create everything fresh
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hostels Table
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Floors Table
CREATE TABLE floors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hostel_id, floor_number)
);

-- Rooms Table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  monthly_rent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(floor_id, room_number)
);

-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monthly_rent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'due', 'pending')),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, month)
);

-- Indexes for better performance
CREATE INDEX idx_floors_hostel_id ON floors(hostel_id);
CREATE INDEX idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX idx_students_room_id ON students(room_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_month ON payments(month);

-- Enable Row Level Security (RLS)
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - you can make this more restrictive later)
CREATE POLICY "Users can view their own hostels" ON hostels
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own hostels" ON hostels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own hostels" ON hostels
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own hostels" ON hostels
  FOR DELETE USING (true);

-- Similar policies for other tables
CREATE POLICY "Users can view floors" ON floors FOR ALL USING (true);
CREATE POLICY "Users can view rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Users can view students" ON students FOR ALL USING (true);
CREATE POLICY "Users can view payments" ON payments FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON hostels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON floors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
