-- Fix: Move all orphaned notes to current user
-- Current user: 2d409701-346a-4341-8fd6-ebd120d5d1fe (Mohammad Shafi)

-- Step 1: Move notes from first orphaned user
UPDATE notes 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = '80d4205d-3204-4202-a10f-191fd6150d8d';
-- This will move: Data Structures IMP topics, IMP POINTS (2 notes)

-- Step 2: Move notes from second orphaned user  
UPDATE notes 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = 'd70f6d32-c03e-44db-9a17-b40adcf6d964';
-- This will move: Linked Lists (1 note)

-- Step 3: Verify all notes now belong to correct user
SELECT 
  user_id::text, 
  title, 
  subject, 
  COUNT(*) as note_count 
FROM notes 
WHERE user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe'
GROUP BY user_id, title, subject;
-- Should show all 3 notes under Mohammad Shafi's user ID