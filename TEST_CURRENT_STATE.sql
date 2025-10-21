-- TEST: Check if the script actually ran and fixed the issue
-- Run this to see current state

-- 1. Check college column constraint
SELECT 
    column_name,
    is_nullable,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'college';

-- 2. Check if trigger exists
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Check if function exists
SELECT 
    proname AS function_name,
    prosrc AS function_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 4. Try a test insert to see what fails
-- (This will fail but show us the exact error)
DO $$
DECLARE
    test_uuid UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (id, email, full_name, college)
    VALUES (
        test_uuid,
        'test@example.com',
        'Test User',
        ''
    );
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_uuid;
    
    RAISE NOTICE 'Test insert successful!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
