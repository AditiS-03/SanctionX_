def calculate_weighted_eligibility(profile, doc_details=None, flags=None):
    """
    Calculates eligibility score (0-100) based on 6 core factors.
    """
    if flags is None: flags = {}
    if doc_details is None: doc_details = {}
    
    score_breakdown = {}
    
    # 1. Income Stability (Weight: 25%)
    # Logic: Stable salaried + income match -> 25/25, Self-employed -> 18-22, Mismatch -> 5-10
    income_score = 0
    declared_income = profile.get("declared_monthly_income", 0) or profile.get("income", 0)
    ocr_income = doc_details.get("amount", 0) if doc_details else 0
    employment = (profile.get("employment_type", "") or profile.get("employment", "unemployed")).lower()
    
    if employment == "salaried":
        income_score = 25
        if ocr_income > 0:
            if declared_income > 0:
                diff = abs(ocr_income - declared_income)
                if (diff / declared_income) > 0.3:
                    income_score = 10 # Mismatch penalty
            else:
                income_score = 10 # Declared 0 but OCR found something
    elif employment == "self-employed":
        income_score = 20
    else:
        income_score = 0
    score_breakdown["income_stability"] = {"score": income_score, "max": 25}

    # 2. EMI-to-Income Ratio (DTI) (Weight: 20%)
    # Logic: <= 30% -> 20, 30-50% -> 10-15, > 50% -> 0
    dti_score = 0
    requested_amount = profile.get("requested_amount", 500000)
    # Estimate EMI (rough approximation: 2% of principal for 60 months)
    estimated_emi = requested_amount * 0.02 
    monthly_income = declared_income if declared_income > 0 else 1 # Avoid div by zero
    dti = (estimated_emi / monthly_income) * 100
    
    if dti <= 30: dti_score = 20
    elif dti <= 40: dti_score = 15
    elif dti <= 50: dti_score = 10
    else: dti_score = 0
    score_breakdown["dti_ratio"] = {"score": dti_score, "max": 20}

    # 3. Credit Score (Weight: 20%)
    # Mock logic: 750-820 -> 20, 700-749 -> 16, 650-699 -> 10, < 650 -> 0
    cs_score = 0
    credit_score = profile.get("credit_score", 720)
    if credit_score >= 750: cs_score = 20
    elif credit_score >= 700: cs_score = 16
    elif credit_score >= 650: cs_score = 10
    else: cs_score = 0
    score_breakdown["credit_score"] = {"score": cs_score, "max": 20}

    # 4. Age Risk Band (Weight: 10%)
    # Logic: 23-45 -> 10, 46-55 -> 7, 18-22 -> 5, 60+ -> 3
    age_score = 0
    age = profile.get("age", 30)
    if 23 <= age <= 45: age_score = 10
    elif 46 <= age <= 55: age_score = 7
    elif 18 <= age <= 22: age_score = 5
    else: age_score = 3
    score_breakdown["age_band"] = {"score": age_score, "max": 10}

    # 5. Fraud Risk Flags (Weight: 15%)
    # Logic: No flags -> 15, Minor -> 8, Major -> 0
    fraud_score = 15
    if flags.get("fraud_detected") or profile.get("fraud_flag"):
        fraud_score = 0
    elif flags.get("minor_flags"):
        fraud_score = 8
    score_breakdown["fraud_check"] = {"score": fraud_score, "max": 15}

    # 6. Loan Purpose Risk (Weight: 10%)
    # Logic: Low risk (Home, Edu, Med) -> 10, Medium (Business) -> 6, High (Personal) -> 3
    purpose_score = 3
    purpose = (profile.get("purpose_type") or profile.get("loan_purpose", "personal")).lower()
    if any(p in purpose for p in ["home", "edu", "med"]): purpose_score = 10
    elif "business" in purpose: purpose_score = 6
    score_breakdown["purpose_risk"] = {"score": purpose_score, "max": 10}

    total_score = sum(item["score"] for item in score_breakdown.values())
    
    # Risk Category
    category = "High Risk"
    color = "red"
    if total_score >= 80: 
        category = "Low Risk"
        color = "green"
    elif total_score >= 60:
        category = "Moderate Risk"
        color = "yellow"

    return {
        "total_score": total_score,
        "breakdown": score_breakdown,
        "risk_category": category,
        "risk_color": color
    }
