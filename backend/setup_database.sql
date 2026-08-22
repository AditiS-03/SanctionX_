-- ============================================
-- SUPABASE DATABASE SETUP - SIMPLIFIED
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Copy and paste the ENTIRE script, then click RUN

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    pan_number TEXT,
    aadhaar_number TEXT,
    credit_score INTEGER,
    purpose_type TEXT,
    pan_card_url TEXT,
    aadhaar_card_url TEXT,
    income_proof_url TEXT,
    employment_proof_url TEXT,
    purpose_proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_MANUAL_REVIEW',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    profile_snapshot_json JSONB,
    loan_details_json JSONB,
    risk_json JSONB,
    sanction_letter_url TEXT,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejection_reason TEXT,
    rejected_at TIMESTAMPTZ
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 4. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if they exist
DROP POLICY IF EXISTS "Service role full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access to loan_applications" ON loan_applications;

-- 6. Create new policies (allow all operations)
CREATE POLICY "Service role full access to user_profiles" 
    ON user_profiles FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role full access to loan_applications" 
    ON loan_applications FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 7. Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Attach triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER update_loan_applications_updated_at
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- You should see "Success. No rows returned" message
-- This means the tables were created successfully

-- To verify, run this query separately:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('user_profiles', 'loan_applications');
