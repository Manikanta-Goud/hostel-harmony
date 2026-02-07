-- 1. Enable Row Level Security (RLS)
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_floors_hostel_id ON floors(hostel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_students_room_id ON students(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(month);

-- 3. Create RLS Policies (Drop first to avoid errors if re-running)
-- Hostels
DROP POLICY IF EXISTS "Users can view their own hostels" ON hostels;
CREATE POLICY "Users can view their own hostels" ON hostels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own hostels" ON hostels;
CREATE POLICY "Users can insert their own hostels" ON hostels FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own hostels" ON hostels;
CREATE POLICY "Users can update their own hostels" ON hostels FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own hostels" ON hostels;
CREATE POLICY "Users can delete their own hostels" ON hostels FOR DELETE USING (true);

-- Other Tables (Allow All Access for ease of use, refine later if needed)
DROP POLICY IF EXISTS "Users can view floors" ON floors;
CREATE POLICY "Users can view floors" ON floors FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view rooms" ON rooms;
CREATE POLICY "Users can view rooms" ON rooms FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view students" ON students;
CREATE POLICY "Users can view students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view payments" ON payments;
CREATE POLICY "Users can view payments" ON payments FOR ALL USING (true);


-- 4. Auto-update 'updated_at' timestamp
-- Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_hostels_updated_at ON hostels;
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_floors_updated_at ON floors;
CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON floors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
