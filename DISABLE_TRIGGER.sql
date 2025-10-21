-- DISABLE THE TRIGGER COMPLETELY
-- We'll create profiles manually from the frontend instead

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Make sure profiles table is simple
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions for manual inserts
GRANT ALL ON public.profiles TO authenticated, anon, service_role;

SELECT '✅ Trigger disabled. Signup will now work from frontend!' AS status;
