-- Complete User Data Report for UID: 86543424-895d-4804-9f0f-89d3f1d2fbf3
-- Copy and paste this in Supabase SQL Editor

WITH user_uid AS (
  SELECT '86543424-895d-4804-9f0f-89d3f1d2fbf3'::uuid as uid
)

-- User Profile Information
SELECT 
  'USER_PROFILE' as data_type,
  up.id as profile_id,
  up.user_id,
  up.email,
  up.username,
  up.full_name,
  up.college_name,
  up.course,
  up.branch,
  up.year,
  up.semester,
  up.programming_languages,
  up.learning_goals,
  up.profile_completed,
  up.profile_setup_step,
  up.created_at,
  up.updated_at
FROM user_profiles up, user_uid
WHERE up.user_id = user_uid.uid

UNION ALL

-- All Notes
SELECT 
  'NOTES' as data_type,
  n.id::text as profile_id,
  n.user_id,
  n.title as email,
  n.content as username,
  n.subject as full_name,
  n.tags::text as college_name,
  n.format as course,
  n.priority as branch,
  n.is_favorite::text as year,
  null as semester,
  null as programming_languages,
  null as learning_goals,
  null as profile_completed,
  null as profile_setup_step,
  n.created_at,
  n.updated_at
FROM notes n, user_uid
WHERE n.user_id = user_uid.uid

UNION ALL

-- User Progress
SELECT 
  'USER_PROGRESS' as data_type,
  up.id::text as profile_id,
  up.user_id,
  up.course_id as email,
  up.completed_chapters::text as username,
  up.quiz_scores::text as full_name,
  up.total_time_spent::text as college_name,
  up.progress_percentage::text as course,
  null as branch,
  null as year,
  null as semester,
  null as programming_languages,
  null as learning_goals,
  null as profile_completed,
  null as profile_setup_step,
  up.created_at,
  up.updated_at
FROM user_progress up, user_uid
WHERE up.user_id = user_uid.uid

UNION ALL

-- Quiz Results
SELECT 
  'QUIZ_RESULTS' as data_type,
  qr.id::text as profile_id,
  qr.user_id,
  qr.quiz_type as email,
  qr.score::text as username,
  qr.total_questions::text as full_name,
  qr.time_taken::text as college_name,
  qr.answers::text as course,
  null as branch,
  null as year,
  null as semester,
  null as programming_languages,
  null as learning_goals,
  null as profile_completed,
  null as profile_setup_step,
  qr.created_at,
  null as updated_at
FROM quiz_results qr, user_uid
WHERE qr.user_id = user_uid.uid

ORDER BY data_type, created_at DESC;