-- Migration: Rename firebase_uid to user_id for Supabase-only public site
-- Run this in Supabase SQL Editor

-- Step 1: Rename the column
ALTER TABLE user_profiles 
RENAME COLUMN firebase_uid TO user_id;

-- Step 2: Update the comment to be clear
COMMENT ON COLUMN user_profiles.user_id IS 'Supabase user ID for public site authentication';

-- Step 3: Verify the change (optional - just to check)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'user_id';