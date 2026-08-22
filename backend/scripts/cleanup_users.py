import os
import sys

# Add parent directory to path to import supabase_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase

def delete_all_users():
    print("Fetching users...")
    # List all users (pagination might be needed for many users, but for now assuming < 50)
    # create_client in supabase_client.py uses service_role key, so we have admin rights
    
    try:
        # Get all users
        users = supabase.auth.admin.list_users()
        
        if not users:
            print("No users found.")
            return

        print(f"Found {len(users)} users. Deleting...")
        
        for user in users:
            uid = user.id
            print(f"Deleting user: {uid} ({user.email})")
            try:
                # Delete from public tables first
                supabase.table('user_profiles').delete().eq('id', uid).execute()
                print(f"Deleted profile for {uid}")
                
                # Delete from auth
                supabase.auth.admin.delete_user(uid)
                print(f"Deleted auth user {uid}")
            except Exception as e:
                print(f"Failed to delete user {uid}: {e}")
                
        print("All users deleted (from auth).")
        
        # Optionally clean up public tables if not cascaded
        # supabase.table('user_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    delete_all_users()
