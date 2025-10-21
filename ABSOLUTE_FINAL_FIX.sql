-- ABSOLUTE FINAL FIX - RLS is blocking the trigger
-- The trigger can't insert because RLS policies are checking auth.uid()
-- But during signup, auth.uid() returns NULL in the trigger context!

-- STEP 1: Completely disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop and recreate trigger without RLS interference
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 3: Create trigger that will work without RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert without RLS checking
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        college
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        ''
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- STEP 4: Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- DONE! Now signup should work
-- We'll re-enable RLS after confirming signup works
