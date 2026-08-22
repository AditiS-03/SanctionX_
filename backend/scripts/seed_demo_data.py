import sys
import os
import datetime
import random

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase
from supabase_helper import create_user_profile, create_loan_application

def seed_data():
    print("Seeding Demo Data...")
    
    users = [
        {
            "id": "demo_user_1",
            "full_name": "Aditi Verma",
            "age": 28,
            "employment_type": "salaried",
            "declared_monthly_income": 85000,
            "pan_number": "ABCDE1234F",
            "kyc_verified": True,
            "email": "aditi@example.com"
        },
        {
            "id": "demo_user_2",
            "full_name": "Rahul Sharma",
            "age": 35,
            "employment_type": "self-employed",
            "declared_monthly_income": 150000,
            "pan_number": "XYZDE1234F",
            "kyc_verified": True,
            "email": "rahul@example.com"
        },
        {
            "id": "demo_user_3",
            "full_name": "Suresh Fraud",
            "age": 22,
            "employment_type": "salaried",
            "declared_monthly_income": 50000,
            "pan_number": "FRAUD1234F",
            "kyc_verified": False,
            "email": "fraud@example.com"
        },
        {
             "id": "demo_user_4",
             "full_name": "Minor Kid",
             "age": 17, # Underage
             "employment_type": "student",
             "declared_monthly_income": 0,
             "kyc_verified": False,
             "email": "kid@example.com"
        },
        {
            "id": "demo_user_5",
            "full_name": "Manual Review Case",
            "age": 45,
            "employment_type": "self-employed",
            "declared_monthly_income": 200000,
            "kyc_verified": True,
            "email": "manual@example.com"
        }
    ]

    for u in users:
        try:
            create_user_profile(u)
            print(f"Created user: {u['full_name']}")
            
            # Add Loan Application for one user
            if u['id'] == "demo_user_5":
                 create_loan_application({
                     "user_id": u['id'],
                     "loan_amount": 500000,
                     "status": "pending",
                     "loan_purpose": "Personal"
                 })
                 print(f"Created pending loan for {u['full_name']}")
        except Exception as e:
            print(f"Error seeding user {u['full_name']}: {e}")

    print("Seeding Complete.")

if __name__ == "__main__":
    seed_data()
