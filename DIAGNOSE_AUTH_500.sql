-- ========================================
-- ALTERNATIVE: Check Supabase Auth Configuration
-- ========================================

-- This 500 error might be because:
-- 1. Email provider not configured
-- 2. Auth settings misconfigured
-- 3. Database user/role permissions issue

-- Let's check auth configuration
SELECT 
    key,
    value
FROM pg_settings
WHERE name LIKE '%auth%'
LIMIT 20;

-- Check if auth schema is accessible
SELECT 
    schema_name
FROM information_schema.schemata
WHERE schema_name = 'auth';

-- Check auth.users table permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'auth'
    AND table_name = 'users';

-- Check if we can even INSERT into auth.users (we shouldn't be able to directly, but check)
-- This is just diagnostic
SELECT 
    has_table_privilege('postgres', 'auth.users', 'INSERT') as postgres_can_insert,
    has_table_privilege('authenticated', 'auth.users', 'INSERT') as authenticated_can_insert,
    has_table_privilege('anon', 'auth.users', 'INSERT') as anon_can_insert;

-- Most importantly: Check for ANY function that runs on auth.users insert
SELECT 
    p.proname as function_name,
    n.nspname as schema,
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE t.tgrelid = 'auth.users'::regclass
ORDER BY t.tgname;
