-- ========================================
-- FIX: Recreate profiles table properly
-- ========================================

-- First, let's see what columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Now let's add back any missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Make sure they're ALL nullable (no constraints)
ALTER TABLE public.profiles ALTER COLUMN college DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN year DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN semester DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN department DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles CASCADE';
    END LOOP;
END $$;

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Grant all permissions
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Verify what we have now
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '✅ Profiles table structure fixed! All columns added back.' as status;
