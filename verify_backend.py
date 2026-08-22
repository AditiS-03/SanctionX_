
try:
    print("Importing main...")
    import backend.main
    print("Importing orchestrator...")
    import backend.agents.orchestrator
    print("Importing fraud_agent...")
    import backend.agents.fraud_agent
    print("Importing eligibility_engine...")
    import backend.agents.eligibility_engine
    print("Importing ocr_agent...")
    import backend.agents.ocr_agent
    print("Importing loan_options_agent...")
    import backend.agents.loan_options_agent
    print("Importing sanction_letter...")
    import backend.agents.sanction_letter
    print("Importing email_agent...")
    import backend.agents.email_agent
    print("All imports successful!")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
