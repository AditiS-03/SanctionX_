-- ============================================
-- DELETE ALL LOAN APPLICATIONS
-- ============================================
-- Run this in your Supabase SQL Editor to clear all loan data

-- 1. Delete all loan applications
DELETE FROM public.loan_applications;

-- 2. Delete fraud flags (if any)
DELETE FROM public.fraud_flags;

-- 3. Delete status tracker entries (if any)
DELETE FROM public.status_tracker;

-- 4. Delete documents (if any)
DELETE FROM public.documents;

-- 5. Verify deletion
SELECT COUNT(*) as applications_count FROM public.loan_applications;
SELECT COUNT(*) as fraud_flags_count FROM public.fraud_flags;
SELECT COUNT(*) as documents_count FROM public.documents;
SELECT COUNT(*) as status_tracker_count FROM public.status_tracker;

-- Expected output: All should return 0

-- ============================================
-- OPTIONAL: Also reset user profiles (if you want fresh start)
-- ============================================
-- Uncomment below to ALSO delete user profiles:
-- DELETE FROM public.user_profiles;

-- ============================================
-- To verify all data is cleared:
-- ============================================
-- SELECT * FROM public.loan_applications; -- Should return 0 rows
-- SELECT * FROM public.user_profiles; -- To check if users remain
