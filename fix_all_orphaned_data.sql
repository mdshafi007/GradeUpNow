-- FIXING ORPHANED DATA
-- Replace '2d409701-346a-4341-8fd6-ebd120d5d1fe' with YOUR current correct user UUID
-- Replace '80d4205d-3204-4202-a10f-191fd6150d8d' with the wrong UUID you want to fix

-- 1. Fix Notes (UPDATE all orphaned notes to correct user)
UPDATE notes 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = '80d4205d-3204-4202-a10f-191fd6150d8d';
-- This will change: ALL notes with wrong UUID → correct UUID

-- 2. Fix User Progress
UPDATE user_progress 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = '80d4205d-3204-4202-a10f-191fd6150d8d';
-- This will change: ALL progress records with wrong UUID → correct UUID

-- 3. Fix Quiz Results  
UPDATE quiz_results 
SET user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe' 
WHERE user_id = '80d4205d-3204-4202-a10f-191fd6150d8d';
-- This will change: ALL quiz results with wrong UUID → correct UUID

-- 4. Verification (run after fixes)
SELECT 
  'AFTER FIX - notes' as table_name, 
  COUNT(*) as records_for_correct_user
FROM notes 
WHERE user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe'

UNION ALL

SELECT 
  'AFTER FIX - user_progress' as table_name,
  COUNT(*) as records_for_correct_user  
FROM user_progress
WHERE user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe'

UNION ALL

SELECT 
  'AFTER FIX - quiz_results' as table_name,
  COUNT(*) as records_for_correct_user
FROM quiz_results 
WHERE user_id = '2d409701-346a-4341-8fd6-ebd120d5d1fe';