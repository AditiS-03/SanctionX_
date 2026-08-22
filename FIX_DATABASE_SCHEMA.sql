-- Run this in your Supabase SQL Editor to fix the "column not found" error

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS pan_card_url TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_card_url TEXT,
ADD COLUMN IF NOT EXISTS income_proof_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
