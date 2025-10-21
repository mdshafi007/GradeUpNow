-- Quick Test: Run this first to check if your database is set up correctly
-- Copy and paste this in Supabase SQL Editor to test connection and schema

-- Test 1: Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notes', 'user_profiles', 'user_progress', 'quiz_results');

-- Test 2: Check notes table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position;

-- Test 3: Check if auth.uid() function works
SELECT auth.uid() as current_user_id;

-- Test 4: Try a simple insert (this will fail if not logged in, but should show the structure)
-- DO NOT RUN THIS IF YOU HAVEN'T RUN THE CLEAN_ALL_DATA.SQL FIRST!

-- If all tests pass, your database is ready
-- If tests fail, you need to run clean_all_data.sql first