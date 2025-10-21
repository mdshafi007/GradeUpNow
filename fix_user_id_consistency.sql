-- Fix: Update notes to use correct user_id
-- Current user: 2d409701-346a-4341-8fd6-ebd120d5d1fe
-- Wrong notes user_id: 80d4205d-3204-4202-a10f-191fd6150d8d

-- Step 1: Update all notes to use the correct user_id
UPDATE notes 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = '80d4205d-3204-4202-a10f-191fd6150d8d';

-- Step 2: Verify the change
SELECT user_id, title, subject, COUNT(*) as note_count 
FROM notes 
WHERE user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe'
GROUP BY user_id, title, subject;