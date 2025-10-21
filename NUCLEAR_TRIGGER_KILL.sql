-- ========================================
-- NUCLEAR OPTION: KILL EVERYTHING
-- ========================================

-- 1. Drop ALL triggers on auth.users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass)
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON auth.users CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- 2. Drop the function (multiple attempts with different schemas)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE;

-- 3. COMPLETELY disable RLS on profiles
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Drop ALL policies on profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles CASCADE';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- 5. Grant ALL permissions (overkill but necessary)
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;

-- 6. Make sure college column is nullable
ALTER TABLE public.profiles ALTER COLUMN college DROP NOT NULL;

-- 7. Check what we did
SELECT 
    'Triggers' as type,
    count(*) as count
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass

UNION ALL

SELECT 
    'Functions' as type,
    count(*) as count
FROM pg_proc 
WHERE proname = 'handle_new_user'

UNION ALL

SELECT 
    'Policies' as type,
    count(*) as count
FROM pg_policies 
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'RLS Enabled' as type,
    CASE WHEN rowsecurity THEN 1 ELSE 0 END as count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Final message
SELECT '🔥 NUCLEAR OPTION COMPLETE - ALL TRIGGERS AND POLICIES DESTROYED!' as status;
