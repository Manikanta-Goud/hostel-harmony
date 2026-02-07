# Expenses and Requirements Feature Guide

## Overview

Two new sections have been added to Hostel Harmony to help you track financial operations:

1. **Expenses** - Track all hostel expenses and calculate profit/loss
2. **Requirements** - Track purchases and requirements for the hostel

## Expenses Feature

### What it tracks:
- **Maintenance**: Repairs, upkeep costs
- **Utilities**: Electricity, water, gas bills
- **Staff Salaries**: Employee payments
- **Supplies**: Consumables, cleaning supplies, etc.
- **Other**: Miscellaneous expenses

### Key Features:
- ✅ Add, edit, and delete expenses
- ✅ Categorize expenses by type
- ✅ Track expenses by date
- ✅ Filter by month
- ✅ **Profit/Loss Calculation**: Automatically calculates:
  - Total Revenue (from student payments)
  - Total Expenses (all expense categories)
  - Net Profit/Loss (Revenue - Expenses)
- ✅ Category-based tabs for easier viewing
- ✅ Add notes to each expense

### How to use:
1. Navigate to **Expenses** from the sidebar
2. Select your hostel and month
3. Click "Add Expense" to record a new expense
4. Choose category, enter description, amount, and date
5. View the profit/loss overview cards at the top
6. Filter by category using tabs

## Requirements Feature

### What it tracks:
- Item purchases (furniture, equipment, etc.)
- Quantity of items
- Total amount spent
- Vendor/supplier information
- Purchase dates

### Key Features:
- ✅ Add, edit, and delete requirements
- ✅ Track quantity and total amount
- ✅ Record vendor information
- ✅ Monthly spending overview
- ✅ Total items purchased counter
- ✅ Add notes for additional details

### How to use:
1. Navigate to **Requirements** from the sidebar
2. Select your hostel and month
3. Click "Add Requirement" to record a purchase
4. Enter item name, quantity, amount, vendor, and date
5. View monthly metrics at the top

## Database Setup

Run the following SQL migration in your Supabase SQL editor:

```sql
-- See the file: supabase-migration-expenses-requirements.sql
```

This will create:
- `expenses` table with proper columns and indexes
- `requirements` table with proper columns and indexes
- Row Level Security (RLS) policies for both tables
- Indexes for better query performance

## Navigation

The new sections appear in the sidebar after Payments:
- Overview
- Hostels
- Rooms
- Families
- Students
- Payments
- **Expenses** 💰 (NEW)
- **Requirements** 📦 (NEW)

## Profit/Loss Calculation

The Expenses page automatically calculates:

**Revenue** = Sum of all paid payments for selected hostel and month
**Expenses** = Sum of all expenses for selected hostel and month
**Profit/Loss** = Revenue - Expenses

- Green color indicates profit
- Red color indicates loss

## Tips

1. **Regular Updates**: Update expenses and requirements regularly for accurate profit/loss tracking
2. **Categorization**: Properly categorize expenses for better insights
3. **Notes**: Use the notes field to add context (e.g., "Fixed AC in Room 101")
4. **Vendor Tracking**: Keep track of vendors for requirements to identify reliable suppliers
5. **Monthly Review**: Review profit/loss monthly to identify trends

## Benefits

- ✅ Better financial visibility
- ✅ Track where money is being spent
- ✅ Identify profitable periods
- ✅ Plan budgets based on historical data
- ✅ Maintain purchase records
- ✅ Vendor management
