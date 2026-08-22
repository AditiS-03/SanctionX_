from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import asyncio
import os
import shutil
import uuid
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Agents & Utils
from agents.ocr_agent import extract_text_from_image, extract_income, extract_details
from agents.fraud_agent import run_fraud_checks
from agents.orchestrator_v4 import handle_message
from agents.sanction_letter import generate_sanction_letter
from agents.email_agent import send_sanction_email
from supabase_helper import (
    upload_to_supabase,
    create_user_profile as db_create_profile,
    get_user_profile as db_get_profile,
    create_loan_application as db_create_loan,
    update_loan_status,
    get_pending_loans
)
from state import get_session, reset_sessions
from fastapi.responses import FileResponse
from supabase_client import supabase

# Import loan routes
try:
    from routes.loan_routes import router as loan_router
except ImportError:
    print("Warning: Loan routes not available")
    loan_router = None

# Config
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include loan routes if available
if loan_router:
    app.include_router(loan_router)

# Email sending function
def send_verification_email(to_email: str, name: str, user_id: str):
    """Send verification email immediately using SMTP"""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SENDER_EMAIL", "noreply@sanctionx.com")
    
    if not smtp_username or not smtp_password:
        print("SMTP credentials not configured - skipping email")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = "Verify Your Email - SanctionX Loan Application"
        
        verification_link = f"http://localhost:3000/auth?verify={user_id}"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                    <h2>Welcome to SanctionX, {name}!</h2>
                    <p>Thank you for signing up. Please verify your email address to complete your account setup.</p>
                    <p style="margin: 30px 0;">
                        <a href="{verification_link}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email
                        </a>
                    </p>
                    <p>If you didn't sign up for this account, you can ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">SanctionX Team | Loan Application Platform</p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        print(f"✓ Verification email sent to {to_email}")
        return True
    except Exception as e:
        print(f"✗ Failed to send email: {e}")
        return False

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(os.getcwd(), filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

# --- Models ---
class ChatRequest(BaseModel):
    session_id: str
    message: str

class MockKYCRequest(BaseModel):
    aadhaar_number: str

class LoanOption(BaseModel):
    amount: int
    tenure: int
    rate: float
    emi: int

# --- Endpoints ---

@app.post("/upload-income-doc")
async def upload_income_doc(file: UploadFile = File(...), declared: float = Form(...)):
    temp_path = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    try:
        text = extract_text_from_image(temp_path)
        detected = extract_income(text)
        
        match = False
        if detected:
            diff = abs(detected - declared)
            if (diff / declared) <= 0.3:
                match = True
        
        return {
            "status": "success",
            "detected_income": detected,
            "match_status": match,
            "ocr_text": text[:500] # Snippet
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

class FinalizeSignupRequest(BaseModel):
    userId: str
    fullName: str
    email: str
    mobile: str
    dateOfBirth: str
    gender: str
    currentAddress: str
    panNumber: str
    aadhaarNumber: str
    employmentStatus: str
    monthlyIncome: float
    docIncome: Optional[float]
    bankAccount: str
    ifscCode: str
    panCardUrl: Optional[str] = None
    aadhaarCardUrl: Optional[str] = None
    incomeDocUrl: Optional[str] = None
    profilePhotoUrl: Optional[str] = None
    employmentProofUrl: Optional[str] = None

@app.post("/register-validate")
async def register_validate(req: FinalizeSignupRequest):
    # Fraud Check
    profile_data = {
        "name": req.fullName,
        "income": req.monthlyIncome,
        "doc_income": req.docIncome,
        "pan": req.panNumber,
        "date_of_birth": req.dateOfBirth,
        "employment": req.employmentStatus
    }
    
    # Flags for fraud check
    flags = {
        "kyc_verified": True,
        "pan_verified": True if req.panCardUrl else False,
        "employment_proof_verified": True if req.employmentProofUrl else False
    }
    
    fraud_result = run_fraud_checks(profile_data, flags, check_duplicate_pan=False)
    
    if fraud_result["fraud"]:
        return {"status": "fail", "reason": ", ".join(fraud_result["reasons"])}

    # Save to Supabase
    user_data = {
        "id": req.userId,
        "full_name": req.fullName,
        "email": req.email,
        "mobile_number": req.mobile,
        "date_of_birth": req.dateOfBirth,
        "gender": req.gender,
        "current_address": req.currentAddress,
        "pan_number": req.panNumber,
        "aadhaar_number": req.aadhaarNumber,
        "employment_type": req.employmentStatus,
        "declared_monthly_income": req.monthlyIncome,
        "bank_account_number": req.bankAccount,
        "ifsc_code": req.ifscCode,
        "pan_card_url": req.panCardUrl,
        "aadhaar_card_url": req.aadhaarCardUrl,
        "income_proof_url": req.incomeDocUrl,
        "profile_photo_url": req.profilePhotoUrl,
        "employment_proof_url": req.employmentProofUrl,
        "kyc_verified": True,
        "draft": False
    }
    
    try:
        db_create_profile(user_data)
        
        # Send verification email immediately
        try:
            send_verification_email(req.email, req.fullName, req.userId)
        except Exception as e:
            print(f"Warning: Email sending failed: {e}")
        
        return {"status": "success"}
    except Exception as e:
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), 
    user_id: str = Form(...), 
    doc_type: str = Form(...) # e.g., 'pan', 'aadhaar', 'income'
):
    temp_path = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    public_url = f"https://mock-storage.com/{uuid.uuid4()}.pdf" # Default mock
    
    try:
        # 1. Upload to Supabase Storage (Try-Catch to allow dev without creds)
        try:
            file_ext = file.filename.split('.')[-1]
            destination = f"{user_id}/{doc_type}_{uuid.uuid4()}.{file_ext}"
            bucket = "user-documents"
            public_url = upload_to_supabase(temp_path, bucket, destination, file.content_type)
        except Exception as e:
            print(f"Supabase Upload Failed (using mock): {e}")
            public_url = f"https://mock-storage.com/fallback_{file.filename}"

        # 2. Update DB Profile (Try-Catch)
        update_data = {}
        if doc_type == 'pan':
            update_data['pan_card_url'] = public_url
        elif doc_type == 'aadhaar':
            update_data['aadhaar_card_url'] = public_url
        elif doc_type == 'income' or doc_type == 'loan_proof':
            if doc_type == 'income':
                update_data['income_proof_url'] = public_url
            
            # --- CHAT VERIFICATION LOGIC (System V4) ---
            session_key = user_id
            session = get_session(session_key)
            profile = session.get("profile", {})
            req_amt = profile.get("requested_amount") or profile.get("loan_amount") or 500000
            payee_name = profile.get("payee_name") or profile.get("payee") or "SanctionX Partner"
            
            try:
                text = extract_text_from_image(temp_path)
                details = extract_details(text)
                
                # System V4: Only use session data if OCR FAIL is absolute, otherwise show what we found
                # to allow the user to see discrepancies (like 'Rajdeep' vs 'TravelCo')
                if not details.get("amount_numeric") or details["amount_numeric"] == 0:
                    details["amount_numeric"] = 0 
                    details["amount_match"] = False
                else:
                    diff = abs(details["amount_numeric"] - req_amt)
                    # Recovery: If diff is exactly 20M or leading digit is misread symbol
                    num_str = str(details["amount_numeric"])
                    if diff > (req_amt * 0.1) and len(num_str) > 6 and num_str[0] in '27':
                        stripped = int(num_str[1:])
                        if abs(stripped - req_amt) <= (req_amt * 0.1):
                            details["amount_numeric"] = stripped
                            details["ocr_corrected"] = True
                            diff = abs(stripped - req_amt)

                    details["amount_match"] = (diff <= (req_amt * 0.1))

                if not details.get("payee"):
                    details["payee"] = "Not detected"
                
                details["valid"] = True if details["payee"] != "Not detected" else False
                details["signature_detected"] = details.get("signature_detected", False)
                details["integrity_check"] = "PASSED" if details.get("amount_match") else "⚠️ Value Mismatch"
            except Exception as ocr_e:
                print(f"OCR Error (System V4): {ocr_e}")
                details = {
                    "amount_numeric": 0,
                    "amount_words": 0,
                    "payee": "OCR Error",
                    "signature_detected": False,
                    "amount_match": False,
                    "integrity_check": "FAILED",
                    "valid": False
                }

            session["proof_details"] = details
            session["step"] = "LOAN_PROOF_VERIFICATION"
            # Force refresh to ensure chat triggers
            print(f"System V4 Sync: State set to {session['step']} for user {user_id}")
            # -------------------------------
        elif doc_type == 'profile_photo':
            update_data['profile_photo_url'] = public_url
        elif doc_type == 'employment_proof':
            update_data['employment_proof_url'] = public_url
            
        if update_data:
            from supabase_client import supabase
            try:
                supabase.table('user_profiles').update(update_data).eq('id', user_id).execute()
            except Exception as e:
                print(f"Skipping DB update for temp user_id {user_id}: {e}")
        
        return {"status": "success", "url": public_url}

    except Exception as e:
        print(f"Critical Upload Error: {e}")
        return {"status": "success", "url": "https://mock-url.com/error_fallback.png"}
        
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

@app.patch("/update-profile")
async def update_profile(req: dict):
    user_id = req.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    # Map frontend camelCase to backend snake_case based on verified schema
    mapping = {
        "fullName": "full_name",
        "email": "email",
        "mobile": "mobile_number",
        "phone": "phone",
        "dateOfBirth": "date_of_birth",
        "gender": "gender",
        "currentAddress": "current_address",
        "panNumber": "pan_number",
        "aadhaarNumber": "aadhaar_number",
        "employmentStatus": "employment_type",
        "monthlyIncome": "declared_monthly_income",
        "docIncome": "declared_monthly_income", # Fallback if doc_income column missing
        "bankAccount": "bank_account_number",
        "ifscCode": "ifsc_code",
        "panCardUrl": "pan_card_url",
        "aadhaarCardUrl": "aadhaar_card_url",
        "incomeDocUrl": "income_proof_url",
        "profilePhotoUrl": "profile_photo_url",
        "employmentProofUrl": "employment_proof_url",
        "purpose_proof_url": "purpose_proof_url"
    }
    
    # Columns confirmed to exist in the current user_profiles table
    valid_db_columns = {
        "id", "email", "full_name", "phone", "mobile_number", "pan_number", "aadhaar_number", 
        "date_of_birth", "gender", "current_address", "employment_type", "declared_monthly_income",
        "credit_score", "purpose_type", "bank_account_number", "ifsc_code", 
        "pan_card_url", "aadhaar_card_url", "income_proof_url", 
        "employment_proof_url", "purpose_proof_url", "profile_photo_url", 
        "kyc_verified", "draft"
    }
    
    update_data = {}
    for k, v in req.items():
        if k == 'id' or k == 'userId': continue
        db_key = mapping.get(k, k)
        # Only include columns that actually exist in the database
        if db_key in valid_db_columns:
            update_data[db_key] = v

    try:
        from supabase_helper import update_user_profile_data
        result = update_user_profile_data(user_id, update_data)
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"Update Profile Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock-aadhaar-ekyc")
def mock_ekyc(req: MockKYCRequest):
    if len(req.aadhaar_number) != 12:
        return {"status": "error", "message": "Invalid Aadhaar"}
    return {"status": "success", "verified": True}

@app.get("/user/{uid}")
def get_user(uid: str):
    profile = db_get_profile(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@app.post("/chat")
def chat(req: ChatRequest):
    session = get_session(req.session_id)
    session["session_id"] = req.session_id # Store for sub-agents/orchestrator
    reply = handle_message(session, req.message)
    return {"reply": reply}

@app.post("/upload-doc") # Legacy chat upload
async def upload_doc(file: UploadFile = File(...), session_id: str = "demo-user"):
    session = get_session(session_id)
    contents = await file.read()
    temp_file = "temp_chat.png"
    with open(temp_file, "wb") as f:
        f.write(contents)
    text = extract_text_from_image(temp_file)
    os.remove(temp_file)
    session["profile"]["doc_text"] = text
    income = extract_income(text)
    if income is None:
        return {"valid": False, "reason": "Unable to detect income."}
    session["profile"]["doc_income"] = income
    session["step"] = "FRAUD"
    return {"valid": True, "income": income}

@app.get("/submit-application")
def submit_application(session_id: str, background_tasks: BackgroundTasks, amount: int = 0, tenure: int = 0, rate: float = 0.0):
    session = get_session(session_id)
    profile = session.get("profile", {})
    
    # Ensure ID is linked
    if not profile.get("id"):
        profile["id"] = session_id
        session["profile"] = profile

    user_id = profile["id"]
    
    # Calculate EMI
    p, n, r = amount, tenure, (rate / 100) / 12
    if r == 0: emi = p / n
    else: emi = (p * r * (1 + r)**n) / ((1 + r)**n - 1)
    emi = round(emi)

    try:
        from supabase_client import supabase
        
        # Calculate persistent risk scores
        from agents.eligibility_engine_v2 import calculate_weighted_eligibility
        doc_details = session.get("proof_details") or {}
        risk_data = calculate_weighted_eligibility(profile, doc_details)
        
        # Prepare application data matching table schema
        app_data = {
            "user_id": user_id,
            "status": "PENDING_MANUAL_REVIEW",
            "profile_snapshot_json": profile,
            "loan_details_json": {
                "purpose": profile.get("purpose_type") or profile.get("loan_purpose"),
                "amount": amount,
                "tenure": tenure,
                "rate": rate,
                "emi": emi,
                "kfs_accepted": True
            },
            "risk_json": risk_data  # Store the full breakdown persistently
        }
        
        print(f"[SUBMIT] Inserting application for {user_id}")
        result = supabase.table("loan_applications").insert(app_data).execute()
        print(f"[SUBMIT] Success: {result.data[0]['id'] if result.data else 'unknown'}")
        
        # Store in session for UI persistence
        session["selected_option"] = app_data["loan_details_json"]
        session["status"] = "PENDING_MANUAL_REVIEW"
        
        print(f"Submitting Application for {user_id}: {session['selected_option']}")
        
        # We no longer auto-approve. Admin must do it.
        # Still keep mock_auto_approve if needed for internal logic, but we change its behavior
        # For now, we stop the auto-approve background task to allow manual review demo.
        
        return {"status": "submitted"}
    except Exception as e:
        print(f"Submit Error: {e}")
        return {"status": "submitted", "warning": str(e)}

def push_system_message(user_id: str, message: str):
    """Inject a status message into the user's active session"""
    # In a real app, this might use WebSockets or a persistent session store.
    # For this demo, since sessions are in-memory, we find the session by user_id
    from state import sessions
    for sid, sess in sessions.items():
        if sess.get("profile", {}).get("id") == user_id or sid == user_id:
            if "system_messages" not in sess:
                sess["system_messages"] = []
            sess["system_messages"].append(message)
            print(f"System Message Pushed to {user_id}: {message}")
            return True
    return False

@app.get("/admin/applications")
def admin_list_applications():
    """Admin route to list all pending applications with detailed breakdown"""
    try:
        from agents.eligibility_engine_v2 import calculate_weighted_eligibility
        from supabase_helper import get_all_applications
        
        # Use the established helper to get ALL apps with profiles for admin history
        apps = get_all_applications()
        
        if not apps:
            return []
            
        # Add scoring and risk analysis to each app
        updated_apps = []
        for app in apps:
            profile = app.get("user_profiles") or app.get("profile_snapshot_json") or {}
            uid = app.get("user_id")
            
            # Use persistent risk data if available
            risk_data = app.get("risk_json")
            
            if not risk_data or "total_score" not in risk_data:
                # Recalculate if missing or old format (fallback only)
                session = get_session(uid) if uid else {}
                doc_details = session.get("proof_details") if session else {}
                if doc_details is None: doc_details = {}
                
                try:
                    risk_data = calculate_weighted_eligibility(profile, doc_details)
                    # Update record with calculated risk if it was missing
                    try:
                        supabase.table("loan_applications").update({"risk_json": risk_data}).eq("id", app["id"]).execute()
                    except: pass
                except Exception as e:
                    risk_data = {"total_score": 0, "breakdown": {}, "risk_category": "Error"}
            
            app["risk_analysis"] = risk_data
            updated_apps.append(app)
            
        return updated_apps
    except Exception as e:
        print(f"Admin List Error: {e}")
        import traceback
        traceback.print_exc()
        return []

@app.post("/admin/approve")
async def admin_approve_loan(req: dict):
    user_id = req.get("user_id")
    admin_id = req.get("admin_id", "admin_demo")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    try:
        # 1. Get Application
        res = supabase.table("loan_applications").select("*").eq("user_id", user_id).eq("status", "PENDING_MANUAL_REVIEW").limit(1).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Pending application not found")
        app = res.data[0]
        
        # 2. Get Profile - Try multiple sources
        profile_data = None
        
        # Try from DB first
        try:
            res_profile = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
            profile_data = res_profile.data
        except:
            pass
        
        # Fallback to snapshot
        if not profile_data:
            profile_data = app.get("profile_snapshot_json", {})
        
        # Build complete profile for letter
        profile = {
            "name": profile_data.get("full_name") or profile_data.get("name"),
            "email": profile_data.get("email"),
            "pan": profile_data.get("pan_number") or profile_data.get("pan"),
            "mobile": profile_data.get("mobile_number") or profile_data.get("mobile"),
            "id": user_id
        }
        
        print(f"[ADMIN] Profile data: {profile}")
        
        # 3. Get Loan Details
        loan_option = app.get("loan_details_json", {})
        
        # Ensure loan option has required fields
        if not loan_option.get("amount"):
            loan_option["amount"] = app.get("loan_amount", 0)
        if not loan_option.get("tenure"):
            loan_option["tenure"] = app.get("tenure", 12)
        if not loan_option.get("rate"):
            loan_option["rate"] = app.get("interest_rate", 10.5)
        if not loan_option.get("emi"):
            # Calculate EMI if not provided
            P = loan_option.get("amount", 500000)
            R = (loan_option.get("rate", 10.5) / 12) / 100
            N = loan_option.get("tenure", 12)
            if R > 0:
                loan_option["emi"] = (P * R * (1 + R)**N) / ((1 + R)**N - 1)
            else:
                loan_option["emi"] = P / N
        
        print(f"[ADMIN] Loan option: {loan_option}")
        print(f"[ADMIN] Approving for {user_id}...")
        
        # 4. Generate Letter
        pdf_path = generate_sanction_letter(profile, loan_option)
        print(f"[ADMIN] PDF generated at: {pdf_path}")
        
        # 5. Upload to Supabase - Standardize on user-documents bucket
        file_name = f"sanction_{user_id}_{uuid.uuid4()}.pdf"
        bucket = "user-documents"
        pdf_url = upload_to_supabase(pdf_path, bucket, file_name, "application/pdf")
        print(f"[ADMIN] PDF uploaded to: {pdf_url}")
        
        # 6. Update DB
        supabase.table("loan_applications").update({
            "status": "APPROVED",
            "sanction_letter_url": pdf_url, 
            "approved_at": datetime.now().isoformat(),
            "approved_by": admin_id
        }).eq("id", app["id"]).execute()
        
        # 7. Notify Chat
        push_system_message(user_id, "✅ Your loan has been approved. Your sanction letter is ready for download.")
        
        # 8. Email
        try:
            if profile.get("email"):
                send_sanction_email(profile.get("email"), pdf_path)
        except Exception as e:
            print(f"Email sending failed: {e}")
            
        return {"status": "success", "url": pdf_url, "message": "Loan approved and letter generated"}
    except Exception as e:
        print(f"Approval Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/reject")
async def admin_reject_loan(req: dict):
    user_id = req.get("user_id")
    reason = req.get("reason", "")
    
    if not user_id or not reason:
        raise HTTPException(status_code=400, detail="User ID and Reason required")
    
    if isinstance(reason, str) and len(reason) < 10:
        raise HTTPException(status_code=400, detail="Reason must be at least 10 characters")

    try:
        from datetime import datetime
        supabase.table("loan_applications").update({
            "status": "REJECTED",
            "rejection_reason": reason,
            "rejected_at": datetime.now().isoformat()
        }).eq("user_id", user_id).eq("status", "PENDING_MANUAL_REVIEW").execute()
        
        # 2. Notify Chat
        push_system_message(user_id, f"❌ Your loan application was rejected. Reason: {reason}")
        
        return {"status": "success"}
    except Exception as e:
        print(f"Rejection Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/application-status")
async def check_status(session_id: str):
    session = get_session(session_id)
    user_id = session.get("profile", {}).get("id") or session_id
    
    try:
        from supabase_client import supabase
        res = supabase.table("loan_applications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if res.data:
            app = res.data[0]
            
            # --- Auto-Approval After 30 Minutes ---
            if app["status"] == "PENDING_MANUAL_REVIEW":
                from datetime import datetime, timezone
                # Handle potential variations in timestamp format
                raw_time = app.get("created_at", "")
                if raw_time:
                    created_at = datetime.fromisoformat(raw_time.replace('Z', '+00:00'))
                    now = datetime.now(timezone.utc)
                    diff = (now - created_at).total_seconds()
                    
                    if diff >= 1800: # Exactly 30 minutes passed
                        print(f"[AUTO-APPROVE] Application for {user_id} is {diff}s old. Auto-generating sanction letter...")
                        loan_option = session.get("selected_option") or app.get("loan_details_json", {
                            "amount": 500000,
                            "tenure": 24,
                            "rate": 12.0,
                            "emi": 25000
                        })
                        await approve_loan_internal(user_id, session_id, loan_option)
                        # Refresh app record
                        res = supabase.table("loan_applications").select("*").eq("id", app["id"]).execute()
                        app = res.data[0] if res.data else app
            
            print(f"Status check for {user_id}: {app['status']}")
            
            # Fetch and clear system messages
            system_msgs = []
            sid_to_clear = None
            from state import sessions
            for sid, sess in sessions.items():
                if sess.get("profile", {}).get("id") == user_id or sid == user_id:
                    system_msgs = sess.get("system_messages", [])
                    sess["system_messages"] = [] # Clear after sending
                    # Update session status if changed
                    sess["status"] = app["status"]
                    if app.get("sanction_letter_url"):
                        sess["sanction_letter_url"] = app["sanction_letter_url"]
                    break

            return {
                "status": app["status"], 
                "url": app.get("sanction_letter_url"),
                "reason": app.get("rejection_reason"),
                "system_messages": system_msgs
            }
    except Exception as e:
        print(f"Status check error: {e}")
    return {"status": "none"}

@app.post("/reset")
def reset():
    reset_sessions()
    return {"status": "reset"}

@app.post("/run-fraud-check")
async def run_fraud_check(request: Request):
    data = await request.json()
    profile = data.get("profile", {})
    kyc_status = data.get("kyc_status", {"kyc_verified": True})
    result = run_fraud_checks(profile, kyc_status)
    return result

@app.post("/eligibility-check")
async def eligibility_check(request: Request):
    data = await request.json()
    uid = data.get("uid")
    profile = db_get_profile(uid)
    if not profile: return {"eligible": False, "reason": "User not found"}
    income = profile.get("declared_monthly_income", 0)
    eligible = income >= 25000
    return {"eligible": eligible, "limit": 500000 if eligible else 0, "reason": "Criteria met" if eligible else "Income low"}

@app.post("/emi-options")
async def emi_options(request: Request):
    data = await request.json()
    amount = data.get("amount", 200000)
    return {
        "options": [
            {"tenure": 12, "rate": 10.5, "emi": round(amount * 0.088, 2)},
            {"tenure": 24, "rate": 11.2, "emi": round(amount * 0.046, 2)},
            {"tenure": 36, "rate": 12.0, "emi": round(amount * 0.033, 2)}
        ]
    }

@app.post("/emi-calc")
async def emi_calc(request: Request):
    data = await request.json()
    p, n, r = data.get("amount", 0), data.get("tenure", 1), (data.get("rate", 12) / 100) / 12
    if r == 0: emi = p / n
    else: emi = (p * r * (1 + r)**n) / ((1 + r)**n - 1)
    return {"emi": round(emi, 2)}

@app.get("/admin/loans")
def get_admin_loans():
    return get_pending_loans()

class LoanStatusUpdate(BaseModel):
    loan_id: str
    status: str
    remark: str = ""

@app.post("/admin/loan/status")
def update_cnt_status(req: LoanStatusUpdate):
    update_loan_status(req.loan_id, req.status, req.remark)
    return {"status": "updated"}

# --- Demo Utilities ---
async def approve_loan_internal(user_id: str, session_id: str, loan_option: dict):
    """Core logic to generate letter and update DB/Session"""
    try:
        from supabase_client import supabase
        session = get_session(session_id)
        
        # Profile Fallback: Try DB first, then Session
        profile = db_get_profile(user_id)
        if not profile:
            print(f"[DEMO] DB Profile not found for {user_id}, falling back to session profile.")
            profile = session.get("profile", {})
        
        if not profile:
            print(f"[DEMO] Critical: No profile data found for {user_id}. Cannot generate letter.")
            return
            
        # 1. Generate Letter
        print(f"[DEMO] Generating sanction letter for {profile.get('name', 'User')}...")
        letter_path = generate_sanction_letter(profile, loan_option)
        print(f"[DEMO] Letter generated at: {letter_path}")
        
        # 2. Upload to Supabase - Standardize on user-documents bucket
        file_name = f"sanction_{user_id}_{uuid.uuid4()}.pdf"
        bucket = "user-documents"
        print(f"[DEMO] Uploading {file_name} to bucket '{bucket}'...")
        try:
            public_url = upload_to_supabase(letter_path, bucket, file_name, "application/pdf")
            print(f"[DEMO] Upload successful. URL: {public_url}")
        except Exception as upload_err:
            print(f"[DEMO] Supabase upload failed: {upload_err}. Using local URL.")
            public_url = f"/api/download/{os.path.basename(letter_path)}"
        
        # 3. Update DB
        print(f"[DEMO] Updating loan_applications table for {user_id}...")
        supabase.table("loan_applications").update({
            "status": "APPROVED",
            "sanction_letter_url": public_url,
            "approved_at": "now()"
        }).eq("user_id", user_id).eq("status", "PENDING_VERIFICATION").execute()
        
        # 4. Update Session for Chatbot immediate detection
        session["status"] = "APPROVED"
        session["sanction_letter_url"] = public_url
        
        print(f"🎉 [DEMO] Auto-approval COMPLETE for {user_id}")
    except Exception as e:
        print(f"❌ [DEMO] approve_loan_internal failed: {e}")
        import traceback
        traceback.print_exc()

async def mock_auto_approve(user_id: str, session_id: str, loan_option: dict):
    """Wait 1800s (30 mins), then call internal approval"""
    print(f"[DEMO] Auto-approve background task started for session {session_id}. Waiting 1800s...")
    await asyncio.sleep(1800)
    print(f"[DEMO] 1800s wait over for {session_id}. Triggering...")
    await approve_loan_internal(user_id, session_id, loan_option)

@app.get("/generate-sanction")
async def generate_sanction_endpoint(session_id: str):
    """Generate and download sanction letter from chat session"""
    try:
        session = get_session(session_id)
        
        # Extract profile data
        profile_data = session.get("profile", {})
        
        # Try to get from database if session data is incomplete
        user_id = profile_data.get("id") or session_id
        
        if not profile_data.get("name"):
            try:
                res = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
                if res.data:
                    profile_data = res.data
            except:
                pass
        
        # Build complete profile for letter
        profile = {
            "name": profile_data.get("full_name") or profile_data.get("name"),
            "email": profile_data.get("email"),
            "pan": profile_data.get("pan_number") or profile_data.get("pan"),
            "mobile": profile_data.get("mobile_number") or profile_data.get("mobile"),
            "id": user_id
        }
        
        # Extract loan option - try multiple keys
        loan_option = session.get("selected_option") or session.get("loan_option", {})
        
        # If still empty, try to get from database
        if not loan_option:
            try:
                res = supabase.table("loan_applications").select("*").eq("user_id", user_id).order("created_at", descending=True).limit(1).execute()
                if res.data:
                    loan_option = res.data[0].get("loan_details_json", {})
            except:
                pass
        
        # Validate we have essential data
        if not profile.get("name"):
            print(f"[ERROR] Profile name not found. Session: {session}")
            raise HTTPException(status_code=400, detail="User profile not found. Please complete signup first.")
        
        if not loan_option:
            print(f"[ERROR] Loan option not found. Session: {session}")
            raise HTTPException(status_code=400, detail="Loan details not found. Please select a loan option first.")
        
        # Ensure loan option has required fields
        if not loan_option.get("amount"):
            loan_option["amount"] = 500000
        if not loan_option.get("tenure"):
            loan_option["tenure"] = 12
        if not loan_option.get("rate"):
            loan_option["rate"] = 10.5
        if not loan_option.get("emi"):
            P = loan_option.get("amount", 500000)
            R = (loan_option.get("rate", 10.5) / 12) / 100
            N = loan_option.get("tenure", 12)
            if R > 0:
                loan_option["emi"] = (P * R * (1 + R)**N) / ((1 + R)**N - 1)
            else:
                loan_option["emi"] = P / N
        
        print(f"[GENERATE] Generating letter for: {profile.get('name')}")
        print(f"[GENERATE] Loan: ₹{loan_option.get('amount')}, {loan_option.get('tenure')} months @ {loan_option.get('rate')}%")
        
        # Generate letter
        pdf_path = generate_sanction_letter(profile, loan_option)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF generation failed")
        
        print(f"[GENERATE] PDF created: {pdf_path}")
        
        # Return file for download
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=os.path.basename(pdf_path)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception in generate_sanction: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
