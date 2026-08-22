"""
Create a test application to verify admin portal works
"""
from supabase_client import supabase
import json

print("Creating test application...")

try:
    # Create test application
    test_app = {
        "user_id": "test-user-12345",
        "status": "PENDING_MANUAL_REVIEW",
        "profile_snapshot_json": {
            "email": "john.doe@example.com",
            "full_name": "John Doe",
            "phone": "+91 9876543210",
            "pan_number": "ABCDE1234F",
            "aadhaar_number": "1234 5678 9012",
            "purpose_type": "Business Loan"
        },
        "loan_details_json": {
            "amount": 500000,
            "tenure": 24,
            "rate": 10.5,
            "emi": 25000,
            "purpose": "Business Expansion"
        },
        "risk_json": {
            "credit_score": 750,
            "eligibility_score": 85
        }
    }
    
    result = supabase.table("loan_applications").insert(test_app).execute()
    print(f"SUCCESS! Created application with ID: {result.data[0]['id']}")
    print(f"\nApplication details:")
    print(f"  User: {test_app['profile_snapshot_json']['full_name']}")
    print(f"  Email: {test_app['profile_snapshot_json']['email']}")
    print(f"  Amount: Rs.{test_app['loan_details_json']['amount']}")
    print(f"  Status: {test_app['status']}")
    print(f"\nNow check http://localhost:3000/admin/applications")
    print("You should see this application!")
    
except Exception as e:
    print(f"ERROR: {e}")
