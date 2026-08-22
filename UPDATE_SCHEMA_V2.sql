-- Run this in your Supabase SQL Editor to add new fields

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS employment_proof_url TEXT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
