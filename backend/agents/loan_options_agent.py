# backend/agents/loan_options_agent.py

def generate_loan_options(profile, max_amount):
    gender = profile.get("gender", "male").lower()
    
    # Base rate logic
    base_rate = 12.0
    if gender == "female":
        base_rate -= 0.5 # Female concession
        
    # Generate 3 Options
    options = []
    
    # Option 1: Aggressive (High Tenure, Max Amount)
    opt1_amount = max_amount
    opt1_tenure = 60
    opt1_rate = base_rate + 1.0 # Slightly higher rate for long tenure
    opt1_emi = calculate_emi(opt1_amount, opt1_rate, opt1_tenure)
    options.append({
        "type": "Max Tenure",
        "amount": opt1_amount,
        "tenure": opt1_tenure,
        "rate": opt1_rate,
        "emi": round(opt1_emi),
        "total_payable": round(opt1_emi * opt1_tenure)
    })
    
    # Option 2: Balanced (Medium Tenure, Medium Amount)
    opt2_amount = int(max_amount * 0.8)
    opt2_tenure = 36
    opt2_rate = base_rate
    opt2_emi = calculate_emi(opt2_amount, opt2_rate, opt2_tenure)
    options.append({
        "type": "Balanced",
        "amount": opt2_amount,
        "tenure": opt2_tenure,
        "rate": opt2_rate,
        "emi": round(opt2_emi),
        "total_payable": round(opt2_emi * opt2_tenure)
    })

    # Option 3: Saver (Short Tenure, Lower Amount)
    opt3_amount = int(max_amount * 0.5)
    opt3_tenure = 12
    opt3_rate = base_rate - 0.5 # Lower rate for short tenure
    opt3_emi = calculate_emi(opt3_amount, opt3_rate, opt3_tenure)
    options.append({
        "type": "Quick Payoff",
        "amount": opt3_amount,
        "tenure": opt3_tenure,
        "rate": opt3_rate,
        "emi": round(opt3_emi),
        "total_payable": round(opt3_emi * opt3_tenure)
    })

    return options


def calculate_emi(principal, rate, months):
    r = rate / (12 * 100)
    if r == 0: return principal / months
    emi = (principal * r * (1 + r)**months) / ((1 + r)**months - 1)
    return emi
