-- Create loan_applications table with correct schema
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_MANUAL_REVIEW',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- JSON columns for flexible data storage
    profile_snapshot_json JSONB,
    loan_details_json JSONB,
    risk_json JSONB,
    
    -- Optional fields
    sanction_letter_url TEXT,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejection_reason TEXT,
    rejected_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);

-- Enable RLS (Row Level Security) - adjust policies as needed
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" ON loan_applications
    FOR ALL
    USING (true)
    WITH CHECK (true);
