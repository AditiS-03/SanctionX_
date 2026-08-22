"""
Quick Database Check and Fix
Run this to verify if tables exist and get instructions
"""

from supabase_client import supabase

def check_database():
    """Check if loan_applications table exists"""
    try:
        # Try to fetch from loan_applications
        result = supabase.table("loan_applications").select("id").limit(1).execute()
        print("✅ Database table EXISTS!")
        print(f"✅ Found {len(result.data)} applications")
        return True
    except Exception as e:
        error_msg = str(e)
        if "relation" in error_msg and "does not exist" in error_msg:
            print("❌ Database table DOES NOT EXIST")
            print("\n📋 TO FIX:")
            print("1. Open Supabase Dashboard → SQL Editor")
            print("2. Copy ALL contents from: backend/setup_database.sql")
            print("3. Click RUN")
            print("4. You should see: 'Success. No rows returned'")
            print("\nThen restart the backend and try again!")
            return False
        else:
            print(f"❌ Error: {error_msg}")
            return False

if __name__ == "__main__":
    print("Checking database setup...\n")
    check_database()
