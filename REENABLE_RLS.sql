-- Re-enable RLS with proper policies after signup fix
-- Run this AFTER confirming signup works

-- Step 1: Re-enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anonymous inserts during signup" ON public.profiles;

-- Step 3: Create secure RLS policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- CRITICAL: This policy allows the trigger to insert profiles during signup
-- The trigger runs as SECURITY DEFINER so it bypasses RLS
-- But we still want this policy for manual inserts
CREATE POLICY "Enable insert for service role"
    ON public.profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Step 4: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Done! Your database now has proper security while still allowing signup.
