-- EMERGENCY DIAGNOSTIC - Find out what's really happening
-- Run this to see the actual error

-- 1. Check if profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT 
    tgname,
    tgenabled,
    tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 4. Try to manually create a test user profile
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Try inserting
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (test_id, 'test@test.com', 'Test User');
    
    RAISE NOTICE 'SUCCESS: Test insert worked!';
    
    -- Cleanup
    DELETE FROM public.profiles WHERE id = test_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'FAILED: %', SQLERRM;
END $$;

-- 5. Check Supabase Auth settings
SELECT 
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;
