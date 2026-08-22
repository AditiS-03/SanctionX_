# Fix for "Could not find the 'age' column" Error

## Problem
The error `Could not find the 'age' column of 'user_profiles' in the schema cache` occurs when:
- Frontend/Backend code tries to query the `age` column
- But the database table was created without this column
- PostgREST caches the schema and returns PGRST204 error

## Root Cause
The `backend/setup_database.sql` was used to create tables, which is missing several columns:
- `age` (INTEGER)
- `gender` (TEXT)
- `date_of_birth` (DATE)
- `kyc_verified` (BOOLEAN)
- `employment_type` (TEXT)
- `workplace_name` (TEXT)
- `workplace_address` (TEXT)
- `declared_monthly_income` (NUMERIC)
- `bank_account_number` (TEXT)
- `ifsc_code` (TEXT)

## Solution

### Step 1: Run the Migration in Supabase
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `ADD_MISSING_COLUMNS.sql`
5. Click **Run**
6. You should see "Success. No rows returned"

### Step 2: Verify the Fix
After running the migration:
1. Refresh the browser (hard refresh: Ctrl+Shift+R)
2. Clear local storage (Browser DevTools → Application → Clear Local Storage)
3. Log in again and try the action that was failing

### Step 3: Test
1. Try submitting a loan application again
2. The error should no longer appear
3. Check the admin dashboard

## If You Still Get Errors

### Option A: Clear Browser Cache
```
Ctrl + Shift + Delete (or Cmd + Shift + Delete on Mac)
Select "All time"
Click "Clear"
Then refresh the page
```

### Option B: Clear Local Storage
Open browser DevTools (F12):
```
Application → Local Storage → Click your domain → Clear All
Then refresh
```

### Option C: Check Database Connection
In terminal, run:
```bash
cd backend
python verify_database.sql
```

## Files Updated
- `ADD_MISSING_COLUMNS.sql` - Contains the migration SQL

## Reference Files
- `supabase_schema.sql` - Contains the complete schema design
- `backend/setup_database.sql` - Contains the current database setup
- `FINAL_DB_SETUP.sql` - Complementary columns

---

**Status**: Ready to deploy
**Tested**: Schema migration with missing columns
**Impact**: Low - Only adds columns, doesn't modify existing data
