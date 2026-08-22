-- Add a column to control visibility of sanction letters on user profiles
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS show_on_profile BOOLEAN DEFAULT true;

-- Hide ALL current sanction letters from user profiles (as requested)
-- This logic ensures they stay in 'admin/applications' (Admin History) but 
-- won't appear in the borrower's dashboard/profile view if filtered by the backend.
UPDATE loan_applications 
SET show_on_profile = false 
WHERE sanction_letter_url IS NOT NULL OR status = 'APPROVED';

-- Instructions for Backend filtering:
-- When fetching loans for the user profile, add: .eq('show_on_profile', true)
