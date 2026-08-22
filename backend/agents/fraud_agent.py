import sys
import os

# Ensure the parent directory is in the path for static analysis tools
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from supabase_client import supabase
except ImportError:
    # Fallback for different environments or direct script execution
    from supabase_client import supabase



def run_fraud_checks(profile, flags, check_duplicate_pan=False):
    """
    Run fraud checks on user profile.
    
    Args:
        profile: User profile data
        flags: Verification flags
        check_duplicate_pan: If True, check for duplicate PANs. False for new registrations.
    """
    reasons = []

    from datetime import datetime
    
    declared_income = profile.get("income")
    doc_income = profile.get("doc_income")
    date_of_birth = profile.get("date_of_birth")
    employment = profile.get("employment")
    pan = profile.get("pan")
    
    # 1. PAN & KYC Verification
    if not flags.get("pan_verified"):
        reasons.append("PAN not verified")
    
    if not flags.get("kyc_verified"):
        reasons.append("Aadhaar eKYC not completed")

    # 2. Age Check from Date of Birth
    if date_of_birth:
        try:
            dob = datetime.strptime(date_of_birth, "%Y-%m-%d")
            age = (datetime.now() - dob).days // 365
            if age < 18:
                reasons.append("Applicant is under 18")
        except:
            reasons.append("Invalid date of birth format")

    # 3. Employment Check
    if employment:
        employment = employment.lower()
    if employment not in ["salaried", "self-employed"]:
        reasons.append("Applicant is unemployed or invalid employment type")
        
    if not flags.get("employment_proof_verified"):
        reasons.append("Employment proof missing or invalid")

    # 4. Income Mismatch Check (> 30%)
    if declared_income and doc_income:
        diff = abs(declared_income - doc_income)
        if diff > (0.30 * declared_income):
            reasons.append(f"Income Mismatch: Declared {declared_income} vs Verified {doc_income}")
    elif declared_income and not doc_income:
        reasons.append("Income proof not verified or OCR failed")

    # 5. Income Range
    if doc_income and doc_income < 5000:
        reasons.append("Verified income is below minimum threshold (5000)")

    # 6. Duplicate PAN Check (Only for loan applications, not new registrations)
    if check_duplicate_pan and pan:
        try:
            # Check if any user already has this PAN
            res = supabase.table('user_profiles').select('id').eq('pan_number', pan).execute()
            if res.data and len(res.data) > 0:
                reasons.append("Multiple accounts detected with same PAN")
        except Exception as e:
            print(f"Warning: Failed to check for duplicate PAN in Supabase: {e}")

    # 7. Loan Amount vs Income Check (if requested_amount exists)
    requested_amount = profile.get("requested_amount")
    if requested_amount and declared_income:
        if requested_amount > (25 * declared_income):
            reasons.append(f"Requested amount ({requested_amount}) exceeds 25x income limit")

    if reasons:
        return {"fraud": True, "reasons": reasons}

    return {"fraud": False, "reasons": []}
