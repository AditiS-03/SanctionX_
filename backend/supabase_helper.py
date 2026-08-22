
from supabase_client import supabase
import uuid
import os

def upload_to_supabase(file_path: str, bucket: str, destination_path: str, content_type: str = None):
    try:
        # Check if bucket exists, if not this might fail or we can try to create
        # For simplicity in this demo, we assume service role can upload
        with open(file_path, 'rb') as f:
            res = supabase.storage.from_(bucket).upload(
                destination_path, 
                f, 
                file_options={"content-type": content_type or "application/octet-stream", "upsert": "true"}
            )
            # In some SDK versions, res might be a response object with 'error'
            if hasattr(res, 'error') and res.error:
                raise Exception(f"Supabase Storage Error: {res.error}")
            
        return supabase.storage.from_(bucket).get_public_url(destination_path)
    except Exception as e:
        print(f"Error in upload_to_supabase: {e}")
        raise e

def create_user_profile(user_data: dict):
    # DEFENSIVE: Handle cases where the same email is used with a different ID
    # (Upsert only handles ID conflict, but email has a UNIQUE constraint)
    email = user_data.get('email')
    user_id = user_data.get('id')
    
    if email:
        try:
            existing = supabase.table('user_profiles').select('id').eq('email', email).execute()
            if existing.data:
                old_id = existing.data[0]['id']
                if old_id != user_id:
                    print(f"Cleaning up stale record for {email} (Old ID: {old_id}, New ID: {user_id})")
                    # Delete old applications first (best practice)
                    supabase.table('loan_applications').delete().eq('user_id', old_id).execute()
                    # Delete the old profile
                    supabase.table('user_profiles').delete().eq('id', old_id).execute()
        except Exception as e:
            print(f"Warning during pre-registration cleanup: {e}")

    res = supabase.table('user_profiles').upsert(user_data).execute()
    return res.data

def get_user_profile(user_id: str):
    try:
        res = supabase.table('user_profiles').select('*').eq('id', user_id).single().execute()
        return res.data
    except Exception:
        return None

def create_loan_application(loan_data: dict):
    res = supabase.table('loan_applications').insert(loan_data).execute()
    return res.data

def update_loan_status(loan_id: str, status: str, remark: str = ""):
    supabase.table('loan_applications').update({'status': status}).eq('id', loan_id).execute()
    # Log in status tracker
    supabase.table('status_tracker').insert({
        'loan_id': loan_id,
        'status_label': status,
        'status_color': 'green' if status == 'approved' else 'red' if status == 'rejected' else 'yellow'
    }).execute()

def get_all_applications():
    try:
        # Fetch all applications for admin view
        res = supabase.table('loan_applications').select('*').order('created_at', desc=True).execute()
        loans = res.data or []
        
        if not loans:
            return []
            
        # Fetch profiles
        user_ids = list(set(l.get("user_id") for l in loans if l.get("user_id")))
        profiles_res = supabase.table('user_profiles').select('*').in_('id', user_ids).execute()
        profiles_map = {p["id"]: p for p in profiles_res.data}
        
        # Merge
        for loan in loans:
            uid = loan.get("user_id")
            loan["user_profiles"] = profiles_map.get(uid)
            
        return loans
    except Exception as e:
        print(f"Error in get_all_applications: {e}")
        return []

def get_pending_loans():
    try:
        # Fetch pending loans
        res = supabase.table('loan_applications').select('*').in_('status', ['PENDING_VERIFICATION', 'PENDING_MANUAL_REVIEW']).execute()
        loans = res.data or []
        
        if not loans:
            return []
            
        # Fetch profiles
        user_ids = list(set(l.get("user_id") for l in loans if l.get("user_id")))
        profiles_res = supabase.table('user_profiles').select('*').in_('id', user_ids).execute()
        profiles_map = {p["id"]: p for p in profiles_res.data}
        
        # Merge
        for loan in loans:
            uid = loan.get("user_id")
            loan["user_profiles"] = profiles_map.get(uid)
            
        return loans
    except Exception as e:
        print(f"Error in get_pending_loans: {e}")
        return []

def update_user_profile_data(user_id: str, profile_data: dict):
    res = supabase.table('user_profiles').update(profile_data).eq('id', user_id).execute()
    return res.data
