-- SIMPLE CHECK: Run these one by one

-- 1. Check notes table
SELECT 'notes' as table_name, user_id::text, COUNT(*) as record_count 
FROM notes 
GROUP BY user_id;

-- 2. Check user_progress table (if exists)  
SELECT 'user_progress' as table_name, user_id::text, COUNT(*) as record_count 
FROM user_progress 
GROUP BY user_id;

-- 3. Check user_profiles table
SELECT 'user_profiles' as table_name, user_id::text, COUNT(*) as record_count 
FROM user_profiles 
GROUP BY user_id;