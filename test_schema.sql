-- TEST SUPABASE SETUP
-- Run this after running clean_all_data.sql to verify everything works

-- Step 1: Test that we can insert a user profile
-- (This would normally be done via your application, but we can simulate it)
-- INSERT INTO user_profiles (user_id, email, full_name) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test User');

-- Step 2: Test that we can insert a note
-- INSERT INTO notes (user_id, title, content, subject) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test Note', 'This is test content', 'programming');

-- Step 3: Verify the structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'notes', 'user_progress', 'quiz_results')
ORDER BY table_name, ordinal_position;

-- Step 4: Check RLS policies
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'notes', 'user_progress', 'quiz_results');

-- Step 5: Verify indexes
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename IN ('user_profiles', 'notes', 'user_progress', 'quiz_results')
ORDER BY tablename, indexname;