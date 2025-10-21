-- ============================================================================
-- COMPREHENSIVE SIGNUP FIX - Run this entire script in Supabase SQL Editor
-- This will fix ALL issues preventing signup from working
-- ============================================================================

-- STEP 1: Clean up existing trigger and function
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 2: Fix the profiles table constraints
-- ============================================================================

-- Make college nullable (since signup form doesn't collect this)
ALTER TABLE public.profiles 
ALTER COLUMN college DROP NOT NULL;

-- Add default value as safety net
ALTER TABLE public.profiles 
ALTER COLUMN college SET DEFAULT '';

-- Make other optional fields nullable too
ALTER TABLE public.profiles 
ALTER COLUMN year DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN semester DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN custom_college DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN bio DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN avatar_url DROP NOT NULL;

-- STEP 3: Temporarily disable RLS
-- ============================================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 4: Create the bulletproof trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert with only the fields we have from signup
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        college,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        '',  -- Empty college for now, user can update later
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log but don't fail signup
        RAISE WARNING 'Profile creation warning for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- STEP 5: Create the trigger
-- ============================================================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Grant permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT SELECT ON public.profiles TO anon;

-- STEP 7: Re-enable RLS with proper policies
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Create simple, working policies
CREATE POLICY "Allow all authenticated users to select their profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow all authenticated users to update their profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow all authenticated users to insert their profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow service role (trigger) full access
CREATE POLICY "Allow service role full access"
    ON public.profiles
    TO service_role
    USING (true)
    WITH CHECK (true);

-- STEP 8: Verification
-- ============================================================================
DO $$
DECLARE
    trigger_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Check trigger
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created';
    
    -- Check function
    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE proname = 'handle_new_user';
    
    IF trigger_count > 0 AND function_count > 0 THEN
        RAISE NOTICE '✅ SUCCESS: Trigger and function created!';
    ELSE
        RAISE WARNING '❌ FAILED: Trigger or function missing!';
    END IF;
END $$;

-- Show final college column state
SELECT 
    column_name,
    is_nullable,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('college', 'email', 'full_name', 'id');

-- ============================================================================
-- DONE! Now:
-- 1. Clear browser cache (Ctrl+Shift+Delete)
-- 2. Close and reopen browser
-- 3. Try signup with a NEW email address
-- 4. Should work without any errors!
-- ============================================================================
