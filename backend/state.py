from supabase_helper import get_user_profile as db_get_profile  # type: ignore

sessions = {}

def get_session(session_id: str):
    if session_id not in sessions:
        # Check if this ID exists in DB
        db_profile = None
        try:
            db_profile = db_get_profile(session_id)
        except:
            pass
            
        sessions[session_id] = {
            "id": session_id,
            "step": "START",
            "profile": db_profile or {},
            "flags": {}
        }
    return sessions[session_id]

def reset_sessions():
    sessions.clear()
