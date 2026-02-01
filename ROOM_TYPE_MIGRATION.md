# Room Type & Wing Feature - Database Migration

## What This Adds:
- **Room Type**: Distinguish between regular rooms and big halls
- **Wing/Section**: Organize rooms by wing (A, B, C, D, etc.)

## Setup Instructions:

### 1. Run the Migration in Supabase

1. Go to your Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the content from `supabase-migration-room-types.sql`
4. Paste and **Run** it
5. You should see "Success" ✅

### 2. Verify the Changes

Go to **Table Editor** → **rooms** table
You should now see two new columns:
- `room_type` (text) - values: 'hall' or 'room'
- `wing` (text) - optional wing/section identifier

## Usage:

When adding a room, you can now:

1. **Select Room Type:**
   - **Regular Room** - for standard rooms (101, 102, etc.)
   - **Big Hall** - for common halls

2. **Specify Wing/Section** (optional):
   - Wing A, Wing B, Part 1, Section A, etc.
   - Helps organize rooms by floor sections

3. **Add Room Number:**
   - For Halls: "Hall A", "Central Hall"
   - For Rooms: "101", "102", "A1"

## Example Structure:

**Floor 1:**
- Wing A
  - Hall A (Big Hall)
  - Room 101 (Regular Room)
  - Room 102 (Regular Room)
- Wing B
  - Hall B (Big Hall)
  - Room 103 (Regular Room)
  - Room 104 (Regular Room)

All data will be saved to Supabase! ☁️
