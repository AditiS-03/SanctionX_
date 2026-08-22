from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from datetime import datetime

from agents.eligibility_engine import check_eligibility
from agents.fraud_agent import run_fraud_checks
from agents.sanction_letter import generate_sanction_letter
from agents.email_agent import send_sanction_email
from supabase_client import supabase
from supabase_helper import update_loan_status, get_pending_loans

router = APIRouter(prefix="/api", tags=["Loan Processing"])

# --- Models ---
class LoanApplicationRequest(BaseModel):
    user_id: str
    loan_purpose: str
    loan_amount: int
    payee: str
    payment_deadline: str
    tenure_months: int

class EligibilityCheckRequest(BaseModel):
    user_id: str
    monthly_income: int
    loan_amount: int
    existing_debt: int = 0

class FraudCheckRequest(BaseModel):
    user_id: str
    pan: str
    aadhaar: str
    income_declared: int

# --- Endpoints ---

@router.post("/loan/create-application")
async def create_loan_application_endpoint(request: LoanApplicationRequest):
    """Create a new loan application"""
    try:
        # Get user profile
        res = supabase.table('user_profiles').select('*').eq('id', request.user_id).single().execute()
        user_data = res.data
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create application document
        application_data = {
            'user_id': request.user_id,
            'loan_purpose': request.loan_purpose,
            'loan_amount': request.loan_amount,
            'payee': request.payee,
            'payment_deadline': request.payment_deadline,
            'tenure_months': request.tenure_months,
            'status': 'created',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'monthly_income': user_data.get('declared_monthly_income', 0),
            'documents_verified': False,
            'fraud_flag': False,
            'eligible': False,
        }
        
        res = supabase.table('loan_applications').insert(application_data).execute()
        
        return {
            'success': True,
            'application_id': res.data[0]['id'] if res.data else None,
            'message': 'Application created successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan/check-eligibility")
async def check_eligibility_endpoint(request: EligibilityCheckRequest):
    """Check loan eligibility"""
    try:
        # Run eligibility engine
        profile = {
            "declared_income": request.monthly_income,
            "requested_amount": request.loan_amount,
            "existing_debt": request.existing_debt
        }
        eligibility_result = check_eligibility(profile, {"kyc_verified": True})
        
        # Update user's eligibility status in Supabase
        supabase.table('user_profiles').update({
            'eligible': eligibility_result.get('eligible', False),
            'max_loan_amount': eligibility_result.get('max_loan_amount'),
            'eligibility_checked_at': datetime.now().isoformat(),
        }).eq('id', request.user_id).execute()
        
        return {
            'eligible': eligibility_result.get('eligible'),
            'max_loan_amount': eligibility_result.get('max_loan_amount'),
            'reason': eligibility_result.get('reason'),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan/check-fraud")
async def check_fraud_endpoint(request: FraudCheckRequest):
    """Check for fraud indicators"""
    try:
        # Run fraud checks
        fraud_result = run_fraud_checks(
            profile={"pan": request.pan, "aadhaar": request.aadhaar, "income": request.income_declared},
            flags={"kyc_verified": True}
        )
        
        # Update fraud flag in Supabase
        supabase.table('user_profiles').update({
            'fraud_flag': fraud_result.get('fraud', False),
            'fraud_checked_at': datetime.now().isoformat(),
        }).eq('id', request.user_id).execute()
        
        return {
            'fraud_detected': fraud_result.get('fraud', False),
            'reasons': fraud_result.get('reasons', []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan/generate-sanction-letter")
async def generate_sanction_letter_endpoint(user_id: str):
    """Generate sanction letter PDF"""
    try:
        # Get user profile
        res_user = supabase.table('user_profiles').select('*').eq('id', user_id).single().execute()
        user_data = res_user.data
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get latest application
        res_app = supabase.table('loan_applications').select('*').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        app_data = res_app.data[0] if res_app.data else None
        
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Generate letter
        letter_data = {
            'name': user_data.get('full_name'),
            'dob': user_data.get('dob'), # Assuming dob exists or is handled
            'loan_amount': app_data.get('loan_amount'),
            'loan_purpose': app_data.get('loan_purpose'),
            'tenure': app_data.get('tenure_months'),
            'rate': 10.5,  # Mock rate
            'approval_date': datetime.now().strftime('%Y-%m-%d'),
            'bank_name': 'SanctionX Bank',
        }
        
        pdf_path = generate_sanction_letter(letter_data)
        
        # Save PDF path to Supabase
        supabase.table('loan_applications').update({
            'sanction_letter_path': pdf_path,
            'sanction_generated_at': datetime.now().isoformat(),
        }).eq('id', app_data['id']).execute()
        
        return {
            'success': True,
            'pdf_path': pdf_path,
            'message': 'Sanction letter generated'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan/send-sanction-email")
async def send_sanction_email_endpoint(user_id: str):
    """Send sanction letter via email"""
    try:
        # Get user profile
        res_user = supabase.table('user_profiles').select('*').eq('id', user_id).single().execute()
        user_data = res_user.data
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_email = user_data.get('email')
        
        # Get latest application
        res_app = supabase.table('loan_applications').select('*').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        app_data = res_app.data[0] if res_app.data else None
        
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        pdf_path = app_data.get('sanction_letter_path')
        
        if not pdf_path:
            raise HTTPException(status_code=400, detail="Sanction letter not generated")
        
        # Send email
        email_result = send_sanction_email(
            recipient_email=user_email,
            user_name=user_data.get('full_name'),
            pdf_path=pdf_path,
            loan_amount=app_data.get('loan_amount')
        )
        
        # Update status
        supabase.table('loan_applications').update({
            'email_sent': True,
            'email_sent_at': datetime.now().isoformat(),
        }).eq('id', app_data['id']).execute()
        
        return {
            'success': True,
            'message': f'Sanction letter sent to {user_email}'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan/update-status")
async def update_application_status_endpoint(
    user_id: str,
    status: str  # 'docs_verified', 'risk_review', 'approved', 'rejected'
):
    """Update application status"""
    try:
        # Get latest application
        res_app = supabase.table('loan_applications').select('id').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        if not res_app.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        app_id = res_app.data[0]['id']
        update_loan_status(app_id, status)
        
        return {
            'success': True,
            'message': f'Status updated to {status}'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/loan/application-status/{user_id}")
async def get_application_status_endpoint(user_id: str):
    """Get application status"""
    try:
        res_app = supabase.table('loan_applications').select('*').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        
        if not res_app.data:
            return {'status': 'not_started'}
        
        app_data = res_app.data[0]
        
        return {
            'status': app_data.get('status'),
            'documents_verified': app_data.get('documents_verified'),
            'fraud_flag': app_data.get('fraud_flag'),
            'eligible': app_data.get('eligible'),
            'created_at': app_data.get('created_at'),
            'updated_at': app_data.get('updated_at'),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/all-applications")
async def get_all_applications_endpoint():
    """Get all loan applications (Admin endpoint)"""
    try:
        # Fetch applications
        res = supabase.table('loan_applications').select('*').execute()
        apps = res.data or []
        
        if not apps:
            return {'total': 0, 'applications': []}
            
        # Fetch profiles
        user_ids = list(set(app.get("user_id") for app in apps if app.get("user_id")))
        profiles_res = supabase.table('user_profiles').select('*').in_('id', user_ids).execute()
        profiles_map = {p["id"]: p for p in profiles_res.data}
        
        # Merge
        for app in apps:
            uid = app.get("user_id")
            app["user_profiles"] = profiles_map.get(uid)
            
        return {
            'total': len(apps),
            'applications': apps
        }
    except Exception as e:
        print(f"Error in get_all_applications_endpoint: {e}")
        return {'total': 0, 'applications': [], 'error': str(e)}

@router.post("/admin/approve-application/{user_id}")
async def approve_application_endpoint(user_id: str):
    """Approve loan application"""
    try:
        res_app = supabase.table('loan_applications').select('id').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        if not res_app.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        app_id = res_app.data[0]['id']
        update_loan_status(app_id, 'approved')
        
        return {
            'success': True,
            'message': f'Application approved'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/reject-application/{user_id}")
async def reject_application_endpoint(user_id: str, reason: str = ""):
    """Reject loan application"""
    try:
        res_app = supabase.table('loan_applications').select('id').eq('user_id', user_id).order('created_at', descending=True).limit(1).execute()
        if not res_app.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        app_id = res_app.data[0]['id']
        update_loan_status(app_id, 'rejected', reason)
        
        return {
            'success': True,
            'message': 'Application rejected'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
