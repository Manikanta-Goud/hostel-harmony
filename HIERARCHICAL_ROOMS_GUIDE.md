# Hierarchical Room Structure Implementation

## 🎯 Goal Structure

```
Floor 1
  └── Part 1 (Section)
      ├── Hall (common area, capacity only, no rent)
      ├── Room 1 (capacity + rent, optional attached bathroom)
      ├── Room 2 (capacity + rent, optional attached bathroom)
      └── Room 3 (capacity + rent, optional attached bathroom)
```

## 📋 Step 1: Run Database Migration

Go to Supabase Dashboard → SQL Editor → New Query

Copy and paste:

```sql
-- Add parent_room_id to support hierarchical room structure
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS parent_room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS has_attached_bathroom BOOLEAN DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_rooms_parent_room_id ON rooms(parent_room_id);

-- Update existing rooms
UPDATE rooms SET has_attached_bathroom = false WHERE has_attached_bathroom IS NULL;
```

Click **Run** ✅

## 🔄 How It Will Work:

### Creating a Section (Part 1, Part 2, etc.):

1. **Add Room** → Select **"Hall + Rooms Section"**
2. Fill in:
   - Section Name: "Part 1"
   - Number of Rooms: 3
3. Click **"Create Hall Section"**

### What Gets Created:

The system will create:
1. **Parent Section** (Part 1) - container only
2. **Hall** (child of Part 1) - you'll set capacity, NO rent
3. **Room 1, Room 2, Room 3** (children of Part 1) - you'll set capacity + rent

### Setting Up Each Room:

After creation, you'll see all rooms listed. Click each to edit:

**For Hall:**
- Name: "Hall" or "Central Hall"
- Capacity: 10 students
- Monthly Rent: 0 (halls don't have rent)

**For Sub-Rooms:**
- Name: "Room 1", "101", etc.
- Capacity: 3 students
- Attached Bathroom: ☑️ Yes → ₹5,500  OR  ☐ No → ₹5,000

## 💰 Rent Pricing:

- **Normal Room**: ₹5,000/month
- **Attached Bathroom**: ₹5,500/month  
- **Hall**: ₹0 (no direct rent, students in hall pay separately)

## 📊 Visual Display:

Rooms will be displayed in a tree structure:

```
📁 Part 1
  🏛️ Hall (10 capacity)
  🚪 Room 1 (3 capacity)  [Attached Bath ₹5,500]
  🚪 Room 2 (3 capacity)  [Normal ₹5,000]
  🚪 Room 3 (3 capacity)  [Attached Bath ₹5,500]
```

## ⚠️ Important Notes:

1. Run the SQL migration FIRST before using the new features
2. The section itself doesn't hold students - only the Hall and Rooms do
3. Total capacity of Part 1 = Hall capacity + all room capacities
4. Students can be assigned to either the Hall OR individual rooms

## 🚀 Next Implementation Steps:

I need to update:
1. ✅ Database schema (done - run migration)
2. ✅ TypeScript types (done)
3. ⏳ Room creation logic (create section + children)
4. ⏳ Room display UI (show hierarchy)
5. ⏳ Room edit dialog (add bathroom toggle)

Currently, the database and types are ready. The UI implementation is next!
