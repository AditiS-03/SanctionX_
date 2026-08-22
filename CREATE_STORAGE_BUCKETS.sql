-- ============================================
-- Create Supabase Storage Buckets for SanctionX
-- ============================================
-- Run this in your Supabase SQL Editor

-- Create sanction_letters bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('sanction_letters', 'sanction_letters', true)
ON CONFLICT (id) DO NOTHING;

-- Create user-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT id, name, public FROM storage.buckets WHERE id IN ('sanction_letters', 'user-documents');

-- Set bucket policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'sanction_letters' OR bucket_id = 'user-documents');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sanction_letters' OR bucket_id = 'user-documents');
