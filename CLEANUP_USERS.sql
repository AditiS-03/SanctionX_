-- ============================================
-- CLEANUP: Remove all existing users
-- ============================================
-- Run this in your Supabase SQL Editor to clear all test data

-- 1. Delete all loan applications first (due to foreign key constraints)
DELETE FROM public.loan_applications;

-- 2. Delete all user profiles
DELETE FROM public.user_profiles;

-- 3. Verify deletion
SELECT COUNT(*) as user_profiles_count FROM public.user_profiles;
SELECT COUNT(*) as applications_count FROM public.loan_applications;

-- Expected output: 0 rows in both tables
-- After this, you can use SSPSPS8156R PAN for your new user

-- ============================================
-- To verify data was cleared:
-- ============================================
-- Run these queries separately:
-- SELECT * FROM public.user_profiles;
-- SELECT * FROM public.loan_applications;
-- Both should return 0 rows
