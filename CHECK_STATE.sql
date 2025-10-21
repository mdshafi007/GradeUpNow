-- CHECK CURRENT STATE - See if trigger still exists

-- 1. Check if trigger exists
SELECT 
    tgname,
    tgenabled,
    tgisinternal
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 4. If trigger EXISTS, it means DISABLE_TRIGGER.sql wasn't run!
-- If trigger DOESN'T exist, the issue is elsewhere

SELECT 'Check complete! Look at results above.' AS message;
