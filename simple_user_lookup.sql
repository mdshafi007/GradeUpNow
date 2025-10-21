-- Simple User Lookup Commands - Run each separately for clear results
-- UID: 86543424-895d-4804-9f0f-89d3f1d2fbf3

-- 1. User Profile
SELECT * FROM user_profiles 
WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3';

-- 2. All Notes
SELECT 
  id,
  title,
  content,
  subject,
  tags,
  format,
  priority,
  is_favorite,
  created_at,
  updated_at
FROM notes 
WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3'
ORDER BY created_at DESC;

-- 3. User Progress
SELECT * FROM user_progress 
WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3';

-- 4. Quiz Results
SELECT * FROM quiz_results 
WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3'
ORDER BY created_at DESC;

-- 5. Summary Count
SELECT 
  (SELECT COUNT(*) FROM user_profiles WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3') as profile_count,
  (SELECT COUNT(*) FROM notes WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3') as notes_count,
  (SELECT COUNT(*) FROM user_progress WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3') as progress_count,
  (SELECT COUNT(*) FROM quiz_results WHERE user_id = '86543424-895d-4804-9f0f-89d3f1d2fbf3') as quiz_count;