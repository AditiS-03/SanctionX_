-- SanctionX Database Upgrades
-- Run this in your Supabase SQL Editor

-- Update loan_applications table with purpose details and credit score
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS purpose_type TEXT,
ADD COLUMN IF NOT EXISTS purpose_details_json JSONB,
ADD COLUMN IF NOT EXISTS credit_score INTEGER;

-- Ensure RLS is updated if needed (usually not needed if already open or using service role)

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'loan_applications';
