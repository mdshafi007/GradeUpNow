-- ============================================================================
-- CLEAN SLATE - Recreate Signup From Scratch
-- ============================================================================

-- STEP 1: Drop everything related to profiles and signup
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop the profiles table completely and recreate it properly
DROP TABLE IF EXISTS public.profiles CASCADE;

-- STEP 2: Create a simple, clean profiles table
-- ============================================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: NO RLS - Keep it disabled for now
-- ============================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 4: Create the simplest possible trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail signup if profile creation fails
        RAISE WARNING 'Profile creation failed: %', SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: Grant all permissions
-- ============================================================================

GRANT ALL ON public.profiles TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- STEP 6: Verification
-- ============================================================================

SELECT 'Setup complete! Signup should work now.' AS status;

-- Show table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
