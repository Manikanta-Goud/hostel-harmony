# Occupancy Type Migration Guide

## Overview
This migration adds support for distinguishing between rooms for students (shared occupancy) and family rooms (single family unit).

## Database Changes

### New Column: `occupancy_type`
- **Type**: TEXT
- **Default**: 'students'
- **Constraint**: CHECK (occupancy_type IN ('students', 'family'))
- **Purpose**: Specifies whether the room is for students or a family

## Migration Steps

### 1. Run the SQL Migration

Execute the migration script in Supabase SQL Editor:

```bash
# Copy contents of supabase-migration-occupancy-type.sql
# Paste into Supabase Dashboard -> SQL Editor -> New Query
# Run the query
```

Or run directly from command line:
```bash
# If you have supabase CLI installed
supabase db push
```

### 2. Verify Migration

Check that the column was added successfully:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'rooms' AND column_name = 'occupancy_type';
```

Expected output:
- column_name: occupancy_type
- data_type: text
- column_default: 'students'
- is_nullable: NO

### 3. Test the Feature

1. Navigate to a hostel detail page
2. Click "Add Room" button
3. You should see a new "Occupancy Type" dropdown with:
   - 👨‍🎓 Students (shared occupancy)
   - 👨‍👩‍👧‍👦 Family (single family unit)
4. Create a room with each occupancy type
5. Verify the data is saved correctly in the database

### 4. Verify Existing Rooms

All existing rooms should automatically have `occupancy_type` set to 'students' as the default.

```sql
SELECT id, room_number, occupancy_type
FROM rooms
LIMIT 10;
```

## Feature Details

### UI Changes
- **Add Room Dialog**: New "Occupancy Type" select field with two options
- **Default Value**: 'students' (when field is not specified)
- **Visual Indicators**: Emoji icons (👨‍🎓 for students, 👨‍👩‍👧‍👦 for family)

### Business Logic
- **Students Rooms**: Designed for shared occupancy, multiple students can be assigned
- **Family Rooms**: Designed for single family unit, capacity indicates family size
- This distinction helps in:
  - Billing management (different rental agreements)
  - Capacity interpretation
  - Student assignment policies
  - Reporting and analytics

## Rollback

If you need to rollback this migration:

```sql
ALTER TABLE rooms
DROP COLUMN occupancy_type;
```

## Notes

- The default value ensures backward compatibility
- All existing rooms are automatically marked as 'students'
- The CHECK constraint ensures data integrity
- Frontend and backend are fully synchronized with this field
