-- MASTER SCHEMA UPDATE FOR SANCTIONX
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Add missing columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS pan_card_url TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_card_url TEXT,
ADD COLUMN IF NOT EXISTS income_proof_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS employment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS current_address TEXT;

-- 2. Verify everything is correct
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
AND column_name IN (
    'pan_number', 'aadhaar_number', 'pan_card_url', 'aadhaar_card_url', 
    'income_proof_url', 'profile_photo_url', 'employment_proof_url', 'current_address', 'gender'
);

-- 3. Trigger PostgREST cache refresh (if needed, though DDL usually does it)
NOTIFY pgrst, 'reload schema';
