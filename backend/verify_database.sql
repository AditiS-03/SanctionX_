-- ============================================
-- VERIFICATION SCRIPT (Run AFTER setup_database.sql)
-- ============================================
-- This script verifies that everything was created correctly
-- Run this SEPARATELY after running setup_database.sql

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'loan_applications');

-- Expected output: 2 rows showing both table names

-- 2. Check loan_applications structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'loan_applications' 
ORDER BY ordinal_position;

-- Expected output: All columns including profile_snapshot_json, loan_details_json, risk_json

-- 3. Test insert (this will actually insert and then delete)
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Insert test data
    INSERT INTO loan_applications (
        user_id, 
        status, 
        profile_snapshot_json, 
        loan_details_json, 
        risk_json
    ) VALUES (
        'test-user-verification',
        'PENDING_MANUAL_REVIEW',
        '{"name": "Test User", "email": "test@example.com"}'::jsonb,
        '{"amount": 500000, "tenure": 24, "rate": 10.5, "emi": 25000}'::jsonb,
        '{"credit_score": 750}'::jsonb
    )
    RETURNING id INTO test_id;
    
    RAISE NOTICE 'SUCCESS! Test insert worked. ID: %', test_id;
    
    -- Clean up
    DELETE FROM loan_applications WHERE id = test_id;
    RAISE NOTICE 'Test data cleaned up. Database is ready!';
END $$;

-- If you see "SUCCESS!" message, everything is working perfectly!
