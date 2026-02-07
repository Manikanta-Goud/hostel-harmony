# 📥 Bulk Import Student Data

## Quick Steps

### 1. Prepare Your Data
1. Open `bulk-import-template.csv` in Excel/Google Sheets
2. Fill in your student data following the template format
3. **Required fields:** hostel_name, floor_number, room_number, student_name, phone, monthly_rent
4. **Optional fields:** All others (leave blank if not available)

### 2. Install Dependencies
```bash
npm install csv-parse
```

### 3. Configure Supabase Connection
1. Open `bulk-import.js`
2. Find line 11: `const SUPABASE_ANON_KEY = 'your-anon-key-here';`
3. Replace with your actual key from Supabase Dashboard → Settings → API
4. Save the file

### 4. Run Import
```bash
node bulk-import.js
```

### 5. Check Results
- The script will show progress for each student
- ✅ = Successfully imported
- ❌ = Error (with reason)
- Final summary shows total imported vs errors

---

## CSV Format Guide

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| hostel_name | Name of hostel | "Sunshine Hostel" | ✅ Yes |
| floor_number | Floor number (integer) | 1 | ✅ Yes |
| part_name | Section/Part name | "Part A" | Optional |
| room_number | Room number | "101" | ✅ Yes |
| student_name | Full name | "Rahul Kumar" | ✅ Yes |
| phone | 10-digit phone | 9876543210 | ✅ Yes |
| email | Email address | rahul@email.com | Optional |
| aadhar_number | 12-digit Aadhar | 123456789012 | Optional |
| monthly_rent | Rent amount | 5000 | ✅ Yes |
| occupation | Student/Employee | "Student" | Optional |
| permanent_address | Home address | "123 Main St Delhi" | Optional |
| work_address | College/Office | "XYZ College" | Optional |
| father_name | Father's name | "Mr Kumar" | Optional |
| mother_name | Mother's name | "Mrs Kumar" | Optional |
| parent_phone | Parent contact | 9876543211 | Optional |
| member_count | Family size | 1 | Optional (default: 1) |
| join_date | Join date (YYYY-MM-DD) | 2024-01-15 | Optional |

---

## Tips

### For Families
- Set `member_count` > 1 (e.g., 4 for family of 4)
- The room will automatically be marked as "family" occupancy

### For Hierarchical Rooms
- Use `part_name` for sections (e.g., "Part A", "Part B")
- Students in the same part will be grouped together

### Common Issues
- **"Failed to insert"**: Check that phone numbers are unique
- **"Column does not exist"**: Run `supabase-complete-fix.sql` first
- **"Invalid floor_number"**: Use integers only (1, 2, 3, not "Ground")

---

## Alternative: SQL Direct Insert

If you prefer SQL, here's a template:

```sql
-- 1. Create hostel (if new)
INSERT INTO hostels (name, address, owner_id)
VALUES ('My Hostel', '123 Street', 'owner-id')
RETURNING id;  -- Copy this ID for next steps

-- 2. Create floor
INSERT INTO floors (hostel_id, floor_number)
VALUES ('hostel-id-from-above', 1);

-- 3. Create room
INSERT INTO rooms (floor_id, room_number, capacity, monthly_rent)
VALUES ('floor-id', '101', 2, 5000);

-- 4. Create student
INSERT INTO students (
  room_id, name, phone, monthly_rent, 
  aadhar_number, occupation, permanent_address
)
VALUES (
  'room-id', 'Student Name', '9876543210', 5000,
  '123456789012', 'Student', '123 Main St'
);
```

---

Need help? Check the console output for detailed error messages!
