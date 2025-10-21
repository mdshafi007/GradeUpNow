-- Check current state after cleanup
SELECT 'auth_users' as source, id::text as user_id, email, created_at
FROM auth.users
WHERE email = 'gradeupnow07@gmail.com'

UNION ALL

SELECT 'user_profiles' as source, user_id::text, email, created_at::text
FROM user_profiles
WHERE email = 'gradeupnow07@gmail.com'

UNION ALL

SELECT 'notes' as source, user_id::text, title, created_at::text
FROM notes
WHERE user_id = '86543494-895d-4804-9f0f-89d3f1d2fbf3';