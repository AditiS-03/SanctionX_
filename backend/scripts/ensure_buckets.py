from supabase_client import supabase

def ensure_buckets():
    try:
        # Check if buckets exist
        buckets = supabase.storage.list_buckets()
        existing_ids = [b.id for b in buckets]
        
        for bucket_id in ['user-documents', 'sanction_letters']:
            if bucket_id not in existing_ids:
                print(f"Creating bucket '{bucket_id}'...")
                supabase.storage.create_bucket(bucket_id, options={'public': True})
                print(f"Bucket '{bucket_id}' created successfully.")
            else:
                print(f"Bucket '{bucket_id}' already exists.")
    except Exception as e:
        print(f"Error ensuring buckets: {e}")

if __name__ == "__main__":
    ensure_buckets()
