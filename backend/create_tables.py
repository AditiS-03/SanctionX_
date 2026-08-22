"""
Direct Database Setup Script
Run this to create the loan_applications table without SQL Editor
"""

from supabase_client import supabase

def setup_database():
    """Create tables directly using Supabase Python client"""
    
    # SQL to create tables
    sql = """
    -- Create user_profiles table
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

    -- Create loan_applications table
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
    """
    
    try:
        # Execute SQL
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Database tables created successfully!")
        print("✅ Indexes created")
        print("✅ Ready to use!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n⚠️  The supabase client might not have RPC access.")
        print("Please run setup_database.sql in Supabase SQL Editor instead.")
        return False

if __name__ == "__main__":
    print("Setting up database tables...")
    setup_database()
