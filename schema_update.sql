-- Manual Verification Workflow Database Update

-- 1. Add role column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Update loan_applications with new required fields
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS profile_snapshot_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS loan_details_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risk_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS doc_urls_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS chat_summary TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- 3. (Optional) Cleanup/Migrate existing status column if needed
-- For this demo, we'll just use the new statuses: 'PENDING_MANUAL_REVIEW', 'APPROVED', 'REJECTED'

-- Enable RLS for Admin access if not already (demo setup usually has this open, but good to check)
-- ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY admin_all ON public.loan_applications FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
