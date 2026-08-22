
import sys
import os
sys.path.append(os.getcwd())

try:
    print("Importing main...")
    import main
    print("Importing agents...")
    import agents.orchestrator
    import agents.fraud_agent
    import agents.eligibility_engine
    import agents.ocr_agent
    import agents.loan_options_agent
    import agents.sanction_letter
    import agents.email_agent
    print("Verification Successful!")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
