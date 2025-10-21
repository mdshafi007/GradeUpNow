-- COMPREHENSIVE CHECK: How much data needs fixing?

-- 1. Check notes table
SELECT 'notes' as table_name, user_id, COUNT(*) as record_count 
FROM notes 
GROUP BY user_id;

-- 2. Check user_progress table  
SELECT 'user_progress' as table_name, user_id, COUNT(*) as record_count 
FROM user_progress 
GROUP BY user_id;

-- 3. Check quiz_results table
SELECT 'quiz_results' as table_name, user_id, COUNT(*) as record_count 
FROM quiz_results 
GROUP BY user_id;

-- 4. Find all orphaned data (UUIDs not in user_profiles)
WITH valid_users AS (
  SELECT user_id::text FROM user_profiles
)
SELECT 
  'ORPHANED NOTES' as issue,
  n.user_id::text as orphaned_uuid,
  COUNT(*) as affected_records
FROM notes n
LEFT JOIN valid_users v ON n.user_id::text = v.user_id
WHERE v.user_id IS NULL
GROUP BY n.user_id::text

UNION ALL

SELECT 
  'ORPHANED PROGRESS' as issue,
  p.user_id::text as orphaned_uuid,
  COUNT(*) as affected_records  
FROM user_progress p
LEFT JOIN valid_users v ON p.user_id::text = v.user_id
WHERE v.user_id IS NULL
GROUP BY p.user_id::text

UNION ALL

SELECT 
  'ORPHANED QUIZ_RESULTS' as issue,
  q.user_id::text as orphaned_uuid,
  COUNT(*) as affected_records
FROM quiz_results q  
LEFT JOIN valid_users v ON q.user_id::text = v.user_id
WHERE v.user_id IS NULL
GROUP BY q.user_id::text;