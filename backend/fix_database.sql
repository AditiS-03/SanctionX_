-- ============================================
-- FIXED DATABASE SETUP - Run this in Supabase SQL Editor
-- This will DROP and RECREATE tables with correct schema
-- ============================================

-- 1. Drop existing tables (if they exist with wrong schema)
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Create user_profiles table
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    mobile_number TEXT,
    pan_number TEXT,
    aadhaar_number TEXT,
    dob DATE,
    gender TEXT,
    current_address TEXT,
    employment_status TEXT,
    employment_type TEXT,
    monthly_income NUMERIC,
    declared_monthly_income NUMERIC,
    doc_income NUMERIC,
    bank_account_number TEXT,
    ifsc_code TEXT,
    credit_score INTEGER,
    purpose_type TEXT,
    pan_card_url TEXT,
    aadhaar_card_url TEXT,
    income_proof_url TEXT,
    employment_proof_url TEXT,
    purpose_proof_url TEXT,
    profile_photo_url TEXT,
    kyc_verified BOOLEAN DEFAULT FALSE,
    draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create loan_applications table with JSONB columns
CREATE TABLE loan_applications (
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

-- 4. Create indexes
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at DESC);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- 5. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (allow all for service role)
CREATE POLICY "Service role full access to user_profiles" 
    ON user_profiles FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role full access to loan_applications" 
    ON loan_applications FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Attach triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! You should see "Success. No rows returned"
