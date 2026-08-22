def calculate_credit_score(profile, fraud_flags, income_doc_match):
    """
    Generate a mock credit score using weighted logic.
    Inputs:
        profile: dict (income, employment_status, age)
        fraud_flags: dict (kyc_verified, fraud_flag)
        income_doc_match: bool
    """
    score = 700
    
    # Adjustments
    if income_doc_match:
        score += 40
    else:
        score -= 40 # income mismatch
        
    employment = profile.get("employment_type", "").lower() or profile.get("employment", "").lower()
    if employment == "salaried":
        score += 30
    elif employment == "self-employed":
        income = profile.get("declared_monthly_income", 0) or profile.get("income", 0)
        if income < 30000:
            score -= 30 # self-employed low income
            
    income = profile.get("declared_monthly_income", 0) or profile.get("income", 0)
    if income > 50000:
        score += 20
        
    if fraud_flags.get("fraud_flag"):
        score -= 60
        
    # Clamp score
    score = max(550, min(850, score))
    
    # Band logic
    if score >= 800:
        band = "Excellent"
    elif score >= 740:
        band = "Good"
    elif score >= 670:
        band = "Fair"
    else:
        band = "Poor"
        
    return {
        "credit_score": score,
        "score_band": band,
        "approval_allowed": score >= 680
    }
