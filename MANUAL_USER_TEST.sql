-- ========================================
-- MANUAL USER CREATION TEST
-- ========================================
-- Let's try creating a user DIRECTLY in the database
-- This will tell us if the problem is with Supabase Auth service

-- First, check if we can see auth.users
SELECT count(*) as total_users FROM auth.users;

-- Try to manually insert a test user (this will likely fail, but let's see the error)
-- DO NOT run this unless you want to test
/*
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'manualtest@example.com',
    crypt('TestPassword123', gen_salt('bf')),
    now(),
    now(),
    now()
);
*/

-- Check if there are any BEFORE INSERT triggers on auth.users
SELECT 
    tgname,
    tgtype,
    tgenabled,
    proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
    AND tgtype & 2 = 2  -- BEFORE trigger
ORDER BY tgname;

-- Check if there are any AFTER INSERT triggers
SELECT 
    tgname,
    tgtype,
    tgenabled,
    proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid  
WHERE tgrelid = 'auth.users'::regclass
    AND tgtype & 4 = 4  -- AFTER trigger
ORDER BY tgname;

SELECT '📊 Trigger analysis complete' as status;
