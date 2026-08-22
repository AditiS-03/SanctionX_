def check_eligibility(profile, flags):
    income = profile.get("income")
    age = profile.get("age")
    employment = profile.get("employment")

    if not flags.get("pan_verified"):
        return False, "PAN not verified"

    if not flags.get("kyc_verified"):
        return False, "Aadhaar eKYC not completed"

    if age is None or age < 18:
        return False, "Applicant must be above 18 years"

    if employment not in ["salaried", "self-employed"]:
        return False, "Only salaried or self-employed applicants allowed"

    if income is None or income < 10000:
        return False, "Minimum income requirement is ₹10,000"

    if flags.get("fraud_risk"):
        return False, "Application flagged as high risk"

    max_amount = income * 20
    return True, max_amount
