# Payment Cycle Feature - Database Migration Guide

## Overview
This migration adds payment cycle functionality to track custom payment schedules for students.

## New Fields Added to `students` Table:
- `payment_cycle` - TEXT ('monthly' or 'custom')
- `custom_days` - INTEGER (number of days for custom cycle)
- `next_payment_due` - TIMESTAMP (next payment due date)

## How to Apply Migration

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-migration-payment-cycle.sql`
4. Paste and run the SQL commands
5. Verify the columns were added successfully

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Verification
After running the migration, verify by checking:
1. The `students` table has the new columns
2. Existing students have `payment_cycle = 'monthly'`
3. Existing students have `next_payment_due` calculated (1 month from join_date)

## Features Added

### 1. When Adding Students:
- **Join Date**: Select the date when student joins
- **Payment Cycle**: Choose between:
  - **Monthly (30 days)**: Standard monthly payment
  - **Custom Days**: For students staying specific durations (10, 20, 45 days, etc.)
- **Custom Days Input**: If custom selected, specify the number of days

### 2. Payment Notifications:
- Notifications show when payment is due based on `next_payment_due` date
- Displays the exact due date for each student
- Shows payment cycle type (monthly or custom X days)

### 3. Smart Due Date Calculation:
- **Monthly**: Due date = join_date + 1 month
- **Custom**: Due date = join_date + custom_days

### Example:
- Student joins on Feb 1, 2026
- Custom cycle: 20 days
- Next payment due: Feb 21, 2026
- After payment, next due: Mar 13, 2026 (20 days later)

## Notes
- Existing students will default to 'monthly' cycle
- The system automatically calculates next payment due date
- Notifications appear when current date >= next_payment_due date
