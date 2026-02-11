# Water Supply & Hostel Rent Tracking Implementation Guide

## Overview
This implementation adds comprehensive water supply tracking with per-unit pricing and hostel rent payment tracking to the Hostel Harmony system.

## Changes Made

### 1. Database Schema Updates
**File**: `supabase-migration-supplier-tracking.sql`

Added the following features:
- Extended `suppliers` table with fields for per-unit pricing:
  - `supply_type`: 'fixed' or 'per_unit'
  - `per_unit_price`: Price per unit (e.g., ₹15 per water can)
  - `current_month_units`: Running count ofunits for current month
  - `total_amount`: Auto-calculated total for per-unit suppliers
  - `month`: Track which month this record is for

- Created `supplier_payments` table to track payment history
- Created `hostel_rent_payments` table to track monthly hostel rent (₹1,20,000)
- Added proper RLS policies for all tables

### 2. TypeScript Type Updates
**File**: `src/types/hostel.ts`

- Extended `Supplier` interface with new fields
- Added `SupplierPayment` interface
- Added `HostelRentPayment` interface

### 3. Context Updates
**File**: `src/contexts/HostelContext.tsx`

- Updated supplier data transformation to include new fields
- Updated `addSupplier` and `updateSupplier` functions to handle per-unit pricing

### 4. Staff Overview Page Updates
**File**: `src/pages/StaffOverview.tsx`

#### Fixed Issues:
1. **✅ Added missing Edit Staff Dialog** - The edit option for staff members now works correctly

#### New Features:
2. **Water Supply Tracking**:
   - Suppliers can now be either "Fixed Monthly Amount" or "Per Unit (Water Cans)"
   - For water suppliers (like Shankar Anna):
     - Set supply type to "Per Unit"
     - Enter price per can (e.g., ₹15)
     - Add daily can count using the edit option
     - System auto-calculates total amount
     - Example: 30 cans × ₹15 = ₹450
   - Enhanced supplier table shows:
     - Unit count for per-unit suppliers
     - Per-unit price
     - Auto-calculated total

3. **Enhanced Supplier Dialogs**:
   - Both Add and Edit dialogs support supply type selection
   - Conditional fields based on supply type
   - Real-time calculation of total amount
   - Improved UX with helper text

## How to Use

### For Water Supply Tracking (Shankar Anna Example):

1. **Add Water Supplier**:
   - Go to Staff Overview → Suppliers tab
   - Click "Add Supplier Record"
   - Name: "Shankar Anna"
   - Supplies: "Water Cans"
   - Supply Type: Select "Per Unit (Water Cans)"
   - Price Per Unit: 15
   - Current Month Units: 0 (start at zero)
   - Click "Add Supplier"

2. **Daily Updates** (Adding cans taken each day):
   - Click the Edit button for Shankar Anna
   - Update "Current Month Units" by adding today's cans
   - Example: If currently 10 cans, and 5 more taken today, enter 15
   - Total Amount updates automatically: 15 × ₹15 = ₹225
   - Click "Update"

3. **End of Month Payment**:
   - View total amount owed for the month
   - Pay Shankar Anna the displayed total
   - The payment history is tracked for future reference

4. **Next Month**:
   - System tracks by month
   - Previous month's data is preserved
   - Start new month with fresh count

### For Fixed Suppliers:

1. Select "Fixed Monthly Amount" as supply type
2. Enter the monthly amount
3. No unit tracking needed

## Database Migration Steps

1. **Backup your database** (always do this before migrations!)

2. **Run the migration**:
   ```sql
   -- Execute the file: supabase-migration-supplier-tracking.sql
   -- This can be run from Supabase Dashboard → SQL Editor
   ```

3. **Verify the migration**:
   - Check that new columns exist in `suppliers` table
   - Check that `supplier_payments` table was created
   - Check that `hostel_rent_payments` table was created
   - Verify RLS policies are active

## Data Storage & History

All supplier data is stored monthly with complete history:
- Every supplier record includes a month field
- Payment history is maintained in `supplier_payments`
- You can query any month's data:
  ```sql
  SELECT * FROM suppliers WHERE month = '2026-02' AND supply_type = 'per_unit';
  ```

## Next Steps (Hostel Rent Integration)

While the database is ready for hostel rent payments, the UI integration in the Payments page is pending. This would add:
- A fourth card showing "Hostel Rent" status
- Monthly rent of ₹1,20,000
- Payment tracking and history
- Integration with Expenses page for proper accounting

## Technical Notes

- Supply type defaults to 'fixed' for backward compatibility
- All monetary calculations use precise decimal types
- Month format: 'YYYY-MM' (e.g., '2026-02')
- Auto-calculation formula: `totalAmount = perUnitPrice × currentMonthUnits`
- Payment records are immutable for audit trail

## Troubleshooting

### If edit option still doesn't work:
1. Clear browser cache
2. Reload the page
3. Check browser console for errors

### If calculations seem wrong:
1. Verify perUnitPrice is set correctly
2. Check currentMonthUnits value
3. Ensure supply_type is 'per_unit'

### If data doesn't persist:
1. Check database migration completed successfully
2. Verify Supabase real-time subscriptions are active
3. Check RLS policies allow your user to write

## Summary

This implementation provides:
- ✅ Fixed staff edit functionality
- ✅ Water can tracking with daily updates
- ✅ Auto-calculated payments based on usage
- ✅ Complete payment history
- ✅ Month-by-month data tracking
- ✅ Flexible system for both fixed and per-unit suppliers
- ✅ Database ready for hostel rent tracking
