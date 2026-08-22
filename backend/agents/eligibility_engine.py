def check_eligibility(profile, flags):
    income = profile.get("declared_monthly_income", 0) or profile.get("income", 0)
    age = profile.get("age", 0)
    employment = (profile.get("employment_type", "") or profile.get("employment", "")).lower()
    credit_score = profile.get("credit_score", 720)
    purpose_type = profile.get("purpose_type", "personal")
    purpose_value = profile.get("purpose_value", 0)
    requested_amount = profile.get("requested_amount", 0)

    reasons = []

    if age < 18:
        reasons.append("Applicant must be above 18")

    if employment not in ["salaried", "self-employed"]:
        reasons.append("Only salaried or self-employed applicants are eligible")

    if income < 15000:
        reasons.append("Minimum income ₹15,000 required")

    if credit_score < 680:
        reasons.append(f"Low credit score ({credit_score})")

    # Purpose specific constraints
    if purpose_type == "home" and purpose_value > 0:
        if requested_amount > (purpose_value * 0.8):
             reasons.append("Loan amount exceeds 80% LTV for Home Loan")
    
    if purpose_type == "education" and purpose_value > 0:
        if requested_amount > purpose_value:
             reasons.append("Loan amount exceeds tuition fee for Education Loan")

    if purpose_type == "vehicle" and purpose_value > 0:
        if requested_amount > purpose_value:
             reasons.append("Loan amount exceeds invoice value for Vehicle Loan")

    if reasons:
        return {"eligible": False, "reasons": reasons}

    max_amount = income * 20

    if credit_score > 750:
        rate = 9.5
    elif credit_score > 700:
        rate = 11
    else:
        rate = 13

    return {
        "eligible": True,
        "max_amount": max_amount,
        "interest_rate": rate
    }
