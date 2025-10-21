-- ULTIMATE FIX - Remove the college NOT NULL constraint
-- This is causing the signup to fail

-- Option 1: Make college nullable (RECOMMENDED)
ALTER TABLE public.profiles 
ALTER COLUMN college DROP NOT NULL;

-- Option 2: Set a default value for college
ALTER TABLE public.profiles 
ALTER COLUMN college SET DEFAULT '';

-- Now update the trigger to handle this properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the simplest possible trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, college)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        ''  -- Empty string for college
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Verify the change
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'college';
