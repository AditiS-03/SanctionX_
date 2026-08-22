"""
Test if database table exists and has data
"""
from supabase_client import supabase

print("Testing database connection...")

try:
    # Test 1: Check if table exists
    print("\n1. Checking if loan_applications table exists...")
    result = supabase.table("loan_applications").select("*").limit(1).execute()
    print(f"   ✓ Table exists! Found {len(result.data)} records")
    
    # Test 2: Try to insert a test record
    print("\n2. Testing insert...")
    test_data = {
        "user_id": "test-debug-user",
        "status": "PENDING_MANUAL_REVIEW",
        "profile_snapshot_json": {"name": "Test User", "email": "test@example.com"},
        "loan_details_json": {"amount": 100000, "tenure": 12},
        "risk_json": {"credit_score": 750}
    }
    insert_result = supabase.table("loan_applications").insert(test_data).execute()
    print(f"   ✓ Insert successful! ID: {insert_result.data[0]['id']}")
    
    # Test 3: Fetch all applications
    print("\n3. Fetching all applications...")
    all_apps = supabase.table("loan_applications").select("*").execute()
    print(f"   ✓ Found {len(all_apps.data)} total applications")
    
    for app in all_apps.data:
        print(f"     - {app['user_id']}: {app['status']}")
    
    # Test 4: Clean up test data
    print("\n4. Cleaning up test data...")
    supabase.table("loan_applications").delete().eq("user_id", "test-debug-user").execute()
    print("   ✓ Test data removed")
    
    print("\n✅ Database is working correctly!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nThis means the table doesn't exist or there's a connection issue.")
    print("Please verify you ran the SQL in Supabase SQL Editor.")
