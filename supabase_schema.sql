-- Supabase Database Schema for SanctionX

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.status_tracker ENABLE ROW LEVEL SECURITY;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT,
    mobile_number TEXT,
    email TEXT UNIQUE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    draft BOOLEAN DEFAULT TRUE,
    employment_type TEXT,
    workplace_name TEXT,
    workplace_address TEXT,
    business_name TEXT,
    registration_number TEXT,
    declared_monthly_income NUMERIC,
    bank_account_number TEXT,
    ifsc_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Applications Table
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    loan_purpose TEXT,
    amount NUMERIC,
    payee_name TEXT,
    payment_deadline DATE,
    tenure INTEGER,
    interest_rate NUMERIC,
    emi NUMERIC,
    total_payable NUMERIC,
    status TEXT DEFAULT 'pending',
    kfs_accepted BOOLEAN DEFAULT FALSE,
    sanction_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    loan_id UUID REFERENCES public.loan_applications(id),
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    ocr_text TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud Flags Table
CREATE TABLE IF NOT EXISTS public.fraud_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    loan_id UUID REFERENCES public.loan_applications(id),
    flag_reason TEXT,
    fraud_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status Tracker Table
CREATE TABLE IF NOT EXISTS public.status_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loan_applications(id) NOT NULL,
    status_label TEXT NOT NULL,
    status_color TEXT DEFAULT 'yellow',
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- User Profiles: users can read/write their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Loan Applications: users can read/write their own applications
CREATE POLICY "Users can view own applications" ON public.loan_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.loan_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents: users can read/write their own documents
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
