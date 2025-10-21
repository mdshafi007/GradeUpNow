-- Fix the existing note to use correct user_id
UPDATE notes 
SET user_id = '86543494-895d-4804-9f0f-89d3f1d2fbf3' 
WHERE title = 'Data Structures';

-- Verify the fix
SELECT 
  user_id::text, 
  title, 
  subject, 
  content,
  created_at
FROM notes 
WHERE user_id = '86543494-895d-4804-9f0f-89d3f1d2fbf3';