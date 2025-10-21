-- EMERGENCY FIX: Disable RLS temporarily to test signup
-- Run this FIRST to see if signup works

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check if profiles table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- All done - try signing up now!
-- If it works, we know RLS was the problem
