-- ============================================
-- FIX MISSING COLUMNS IN user_profiles
-- ============================================
-- Run this script in your Supabase SQL Editor
-- to add the missing age and gender columns

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS employment_type TEXT,
ADD COLUMN IF NOT EXISTS workplace_name TEXT,
ADD COLUMN IF NOT EXISTS workplace_address TEXT,
ADD COLUMN IF NOT EXISTS declared_monthly_income NUMERIC,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';
