import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL") or "YOUR_SUPABASE_URL"
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "YOUR_SUPABASE_SERVICE_ROLE_KEY"

supabase: Client = create_client(url, key)
