from agents.fraud_agent import run_fraud_checks
from agents.eligibility_engine import check_eligibility
from agents.loan_options_agent import generate_loan_options
from agents.ocr_agent import extract_details, extract_text_from_image
from agents.credit_score_agent import calculate_credit_score
from supabase_helper import get_user_profile as db_get_profile
from agents.sanction_letter import generate_sanction_letter
import re
import os

def _refresh_profile_details(session, profile):
    """Helper to refresh profile from database to ensure real-time sync"""
    try:
        from supabase_helper import get_user_profile as db_get_profile
        # Try to get user_id from various session keys
        user_id = profile.get("id") or session.get("session_id") or session.get("id")
        if user_id:
            db_profile = db_get_profile(user_id)
            if db_profile:
                # Merge db details into session profile
                profile.update({
                    "id": db_profile.get("id", profile.get("id")),
                    "email": db_profile.get("email", profile.get("email")),
                    "full_name": db_profile.get("full_name", profile.get("full_name")),
                    "phone": db_profile.get("mobile_number", profile.get("phone")),
                    "pan_number": db_profile.get("pan_number", profile.get("pan_number")),
                    "aadhaar_number": db_profile.get("aadhaar_number", profile.get("aadhaar_number"))
                })
                session["profile"] = profile
                return True
    except Exception as e:
        print(f"Error refreshing profile details: {e}")
    return False

def handle_message(session, message):
    msg_lower = str(message).lower().strip()
    step = session.get("step", "PURPOSE")
    
    # 1. FORCED GLOBAL RESETS (Use whole-word matching to avoid "Washington"/ "hi" conflict)
    reset_words = {"reset", "restart", "start", "hi", "hello"}
    # Split by non-alphanumeric to check for exact words
    words = set(re.findall(r'\w+', msg_lower))
    if any(w in reset_words for w in words):
        session.clear()
        session["step"] = "PURPOSE"
        session["profile"] = {}
        session["retry_count"] = 0
        session["doc_retry_count"] = 0
        return "Welcome to SanctionX! 👋 (System V4 Active). How can I assist you with your loan application today?"

    # 2. GLOBAL UPLOAD HANDLER (Highest Priority)
    # If the frontend signals an upload, and we have details or the state was set by main.py
    # We process it IMMEDIATELY regardless of where we were in the questions.
    if msg_lower == "proof_uploaded" or session.get("step") == "LOAN_PROOF_VERIFICATION":
        doc_details = session.get("proof_details", {})
        if not doc_details:
             return "Analyzing your document... please wait a moment."
            
        # 3. CLEAN RESPONSE FORMAT (As requested - no stars)
        payee = doc_details.get('payee', 'N/A')
        amount_num = doc_details.get('amount_numeric', 0)
        amount_words = doc_details.get('raw_words', 'N/A')
        is_balance = doc_details.get('is_balance', False)
        label = doc_details.get('label_detected', 'Amount')
        
        amt_label = "Amount Remained to be Paid" if is_balance else "Detected Amount"
        
        if doc_details.get('amount_match'):
            msg = (
                f"✅ OCR Verification Summary\n\n"
                f"Payee Name: {payee}\n"
                f"{amt_label}: ₹{amount_num:,}\n"
                f"Detected Amount (In Words): {amount_words}\n"
                f"Amount Match Status: ✅ Matched with Loan Request\n"
                f"Signature Check: {'✅ Detected' if doc_details.get('signature_detected') else '❌ Not Found'}\n"
                f"Document Integrity: {'✅ Valid' if doc_details.get('integrity_check') == 'PASSED' else '⚠️ ' + str(doc_details.get('integrity_check', 'Issue'))}\n\n"
                f"Does this information look correct?\n"
                f"Please say 'Confirm' to proceed or 'Retry' to upload again."
            )
            session["step"] = "CONFIRM_DOC_DETAILS"
        else:
            msg = (
                f"⚠️ OCR Verification Issue\n\n"
                f"{amt_label}: ₹{amount_num:,}\n"
                f"Amount in Words: {amount_words or 'Unable to detect'}\n"
                f"Mismatch Detected: ❌ (Requested amount does not match document balance)\n\n"
                f"Please upload a clearer document or retry."
            )
            session["step"] = "PROOF" # Ask to upload again
            
        return msg

    # 3. AGGRESSIVE INTENT DETECTION (Jump to branches)
    # Only detect intent if we are not already deep in a specific loan branch
    is_in_branch = step.startswith(("HOME_", "EDU_", "VEHICLE_", "MED_"))
    
    loan_intent = None
    if not is_in_branch:
        if "home" in msg_lower: loan_intent = ("home", "HOME_ADDRESS", "🏡 Great! Please provide the property address for your home loan.")
        elif "edu" in msg_lower or "student" in msg_lower or "universit" in msg_lower: loan_intent = ("education", "EDU_UNIVERSITY", "🎓 Excellent. Which university or institution is this for?")
        elif "car" in msg_lower or "vehicle" in msg_lower or "bike" in msg_lower: loan_intent = ("vehicle", "VEHICLE_DEALER", "🚗 Noted. What is the dealership name?")
        elif "medical" in msg_lower or "health" in msg_lower or "hospit" in msg_lower: loan_intent = ("medical", "MED_HOSPITAL", "🏥 Understood. Please provide the hospital name.")

    if loan_intent:
        cat, next_step, greeting = loan_intent
        session["step"] = next_step
        session["purpose_category"] = cat
        session["retry_count"] = 0
        session["doc_retry_count"] = 0
        if "profile" not in session: session["profile"] = {}
        session["profile"]["loan_purpose"] = message
        return greeting

    # 4. STATE MACHINE
    step = session.get("step", "PURPOSE")
    profile = session.get("profile", {})
    
    if step == "PURPOSE":
        session["step"] = "AMOUNT"
        profile["loan_purpose"] = message
        session["profile"] = profile
        return "Got it. How much loan amount do you need?"

    # --- BRANCH LOGIC ---
    if step == "HOME_ADDRESS":
        profile["home_details"] = {"address": message}
        session["step"] = "HOME_TYPE"
        return "What is the property type? (1BHK / 2BHK / 3BHK / Villa / Plot)"
    if step == "HOME_TYPE":
        profile["home_details"]["type"] = message
        session["step"] = "HOME_VALUE"
        return "What is the property purchase value (total price)?"
    if step == "HOME_VALUE":
        try:
            val = int(re.sub(r'[^\d]', '', message))
            profile["home_details"]["value"] = val
            profile["purpose_value"] = val
            session["step"] = "HOME_BUILDER"
            return "Who is the builder or seller name?"
        except: return "Please enter a valid numeric value for the property."
    if step == "HOME_BUILDER":
        profile["home_details"]["builder"] = message
        session["step"] = "AMOUNT"
        return "Understood. How much loan amount do you need?"

    # EDUCATION BRANCH
    if step == "EDU_UNIVERSITY":
        profile["education_details"] = {"university": message}
        session["step"] = "EDU_COUNTRY"
        return "Which country is the university located in?"
    if step == "EDU_COUNTRY":
        profile["education_details"]["country"] = message
        session["step"] = "EDU_COURSE"
        return "What is the name of the course?"
    if step == "EDU_COURSE":
        profile["education_details"]["course"] = message
        session["step"] = "EDU_DURATION"
        return "What is the course duration (e.g., 2 years)?"
    if step == "EDU_DURATION":
        profile["education_details"]["duration"] = message
        session["step"] = "EDU_FEE"
        return "What is the total tuition fee amount?"
    if step == "EDU_FEE":
        try:
            val = int(re.sub(r'[^\d]', '', message))
            profile["education_details"]["fee"] = val
            profile["purpose_value"] = val
            session["step"] = "AMOUNT"
            return "Got it. How much loan amount do you need for your education?"
        except: return "Please enter a valid numeric value."

    if step == "VEHICLE_DEALER":
        profile["vehicle_details"] = {"dealer": message}
        session["step"] = "VEHICLE_TYPE"
        return "What is the vehicle type (e.g., SUV, Sedan, Bike)?"
    if step == "VEHICLE_TYPE":
        profile["vehicle_details"]["type"] = message
        session["step"] = "VEHICLE_PRICE"
        return "What is the on-road price of the vehicle?"
    if step == "VEHICLE_PRICE":
        try:
            val = int(re.sub(r'[^\d]', '', message))
            profile["vehicle_details"]["price"] = val
            profile["purpose_value"] = val
            session["step"] = "AMOUNT"
            return "Understood. How much loan amount do you need?"
        except: return "Please enter a valid numeric value."

    if step == "MED_HOSPITAL":
        profile["medical_details"] = {"hospital": message}
        session["step"] = "MED_TREATMENT"
        return "What type of treatment is this for?"
    if step == "MED_TREATMENT":
        profile["medical_details"]["treatment"] = message
        session["step"] = "MED_BILL"
        return "What is the estimated bill amount?"
    if step == "MED_BILL":
        try:
            val = int(re.sub(r'[^\d]', '', message))
            profile["medical_details"]["bill_amount"] = val
            profile["purpose_value"] = val
            session["step"] = "AMOUNT"
            return "Understood. How much loan amount do you need?"
        except: return "Please enter a valid numeric value."

    # --- COMMON STEPS ---
    if step == "AMOUNT":
        try:
            amount = int(re.sub(r'[^\d]', '', message))
            profile["requested_amount"] = amount
            session["step"] = "PAYEE"
            return "Who is the payee (dealer/builder/hospital)?"
        except: return "Please enter a valid numeric amount."

    if step == "PAYEE":
        profile["payee_name"] = message
        profile["purpose_type"] = session.get("purpose_category", "personal_other")
        session["step"] = "PROOF"
        cat = session.get("purpose_category", "personal_other")
        prompts = {"home": "property agreement", "education": "admission letter", "vehicle": "invoice", "medical": "estimate"}
        return f"Please upload the {prompts.get(cat, 'proof document')}."

    if step == "PROOF":
        return "Please use the attachment button (📎) to upload the proof document."

    if step == "CONFIRM_DOC_DETAILS":
        # Check for confirmation words, excluding 'y' if it's part of 'retry'
        confirm_words = ["yes", "confirm", "proceed", "correct", "ok"]
        is_confirm = any(w in msg_lower for w in confirm_words) or msg_lower == "y"
        
        if is_confirm:
            # REFRESH PROFILE BEFORE SHOWING
            _refresh_profile_details(session, profile)
            
            session["step"] = "SHOW_PROFILE"
            
            msg = (
                f"✅ Document Verified!\n\n"
                f"Here are your profile details:\n"
                f"━━━━━━━━━━━━━━━━━━━━━━\n"
                f"Email: {profile.get('email', 'Not provided')}\n"
                f"Full Name: {profile.get('full_name', 'Not provided')}\n"
                f"Phone: {profile.get('phone', 'Not provided')}\n"
                f"PAN: {profile.get('pan_number', 'Not provided')}\n"
                f"Aadhaar: {profile.get('aadhaar_number', 'Not provided')}\n"
                f"Purpose: {profile.get('purpose_type', 'Not provided')}\n"
                f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"Would you like to proceed with these details?\n"
                f"Say 'Yes' to continue or 'Edit' to modify any field."
            )
            return msg
        elif "retry" in msg_lower:
            session["step"] = "PROOF"
            session["proof_details"] = None # Clear old details for new upload
            return "No problem. Please upload the document again."
        return "Please say 'Confirm' to proceed or 'Retry' to upload again."
    
    if step == "SHOW_PROFILE":
        # Refresh profile again just in case a field was updated externally
        _refresh_profile_details(session, profile)

        if any(w in msg_lower for w in ["yes", "proceed", "continue", "y", "correct", "ok"]):
            # Proceed to credit score
            score_data = calculate_credit_score(profile, {"fraud_flag": False}, True)
            profile["credit_score"] = score_data["credit_score"]
            profile["score_band"] = score_data["score_band"]
            session["profile"] = profile

            options = generate_loan_options(profile, profile.get("requested_amount", 500000))
            session["options"] = options
            session["step"] = "SELECT_OPTION"

            return f"📊 Scoring Complete!\n\nScore: {profile['credit_score']}.\n\nEligible Options:|||MATCH_FOUND::{profile['credit_score']}"
        
        elif "edit" in msg_lower or "change" in msg_lower or "modify" in msg_lower:
            session["step"] = "EDIT_PROFILE_FIELD"
            return (
                "Which detail would you like to update?\n\n"
                "Please specify one of:\n"
                "• Email\n"
                "• Name\n"
                "• Phone\n"
                "• PAN\n"
                "• Aadhaar\n"
                "• Purpose"
            )
        else:
            return "Please say 'Yes' to proceed or 'Edit' to modify any field."
    
    if step == "EDIT_PROFILE_FIELD":
        # Determine which field to edit
        field_map = {
            "email": ("email", "Email"),
            "name": ("full_name", "Full Name"),
            "phone": ("mobile_number", "Phone Number"),
            "pan": ("pan_number", "PAN"),
            "aadhaar": ("aadhaar_number", "Aadhaar"),
            "purpose": ("purpose_type", "Loan Purpose")
        }
        
        selected_field = None
        for key, (db_field, display_name) in field_map.items():
            if key in msg_lower:
                selected_field = (db_field, display_name)
                break
        
        if selected_field:
            from typing import Tuple, cast
            field_data = cast(Tuple[str, str], selected_field)
            db_field, display_field = field_data  # type: ignore
            session["editing_field"] = db_field
            session["editing_field_name"] = display_field
            session["step"] = "EDIT_FIELD_VALUE"
            return f"What should the new {display_field} be?"
        else:
            return "Please specify a valid field: Email, Name, Phone, PAN, Aadhaar, or Purpose"
    
    if step == "EDIT_FIELD_VALUE":
        # Update the field
        field = session.get("editing_field")
        field_name = session.get("editing_field_name")
        profile[field] = message
        session["profile"] = profile
        
        # Save to database
        from supabase_client import supabase
        try:
            user_id = profile.get("id")
            if user_id:
                supabase.table("user_profiles").update({field: message}).eq("id", user_id).execute()
        except Exception as e:
            print(f"Profile update error: {e}")
        
        # Show updated profile
        session["step"] = "SHOW_PROFILE"
        msg = (
            f"✅ Updated {field_name} to: {message}\n\n"
            f"Updated Profile:\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Email: {profile.get('email', 'Not provided')}\n"
            f"Full Name: {profile.get('full_name', 'Not provided')}\n"
            f"Phone: {profile.get('phone', 'Not provided')}\n"
            f"PAN: {profile.get('pan_number', 'Not provided')}\n"
            f"Aadhaar: {profile.get('aadhaar_number', 'Not provided')}\n"
            f"Purpose: {profile.get('purpose_type', 'Not provided')}\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"Would you like to proceed or edit another field?"
        )
        return msg

    if step == "SELECT_OPTION":
        if "selected" in msg_lower or re.search(r"\d+", message):
            session["step"] = "WAITING_APPROVAL"
            return (
                "✅ Selection Received.\n\n"
                "Your application is now under Manual Verification. Please wait for approx 30 minutes while our credit team reviews your documents.\n\n"
                "You can type 'check status' in a while to see the final decision."
            )
        return "Please select an option from the list above."

    if step == "WAITING_APPROVAL":
        # Check current status
        status = session.get("status")
        letter_url = session.get("sanction_letter_url")
        reason = session.get("rejection_reason")

        if status == "APPROVED":
            session["step"] = "COMPLETED"
            return (
                f"🎉 Application Approved!\n\n"
                f"Our credit team has completed the manual verification. Your digital sanction letter is now available.\n\n"
                f"📄 [Download Sanction Letter]({letter_url or '#'})"
            )
        
        if status == "REJECTED":
            session["step"] = "COMPLETED"
            return (
                f"❌ Application Status: Rejected\n\n"
                f"Reason: {reason or 'Does not meet current credit policy guidelines.'}\n\n"
                f"You can view more details in your Profile page."
            )

        if "status" in msg_lower or "check" in msg_lower:
            return "Your application is still under Manual Review. Our team is currently reviewing your profile and documents. Please check back shortly."
            
        return "Manual verification is in progress. Our credit team will update you shortly. Type 'check status' if you want to see the latest update."

    return "Thank you for using SanctionX. Your journey is complete. Is there anything else I can assist you with?"
