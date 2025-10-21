-- ========================================
-- DROP THE HIDDEN TRIGGER!
-- ========================================

-- This is the REAL culprit!
DROP TRIGGER IF EXISTS create_default_categories_trigger ON auth.users CASCADE;
DROP FUNCTION IF EXISTS create_default_categories() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_categories() CASCADE;

-- Also drop our old trigger just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Check what triggers remain
SELECT 
    tgname as trigger_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%';

SELECT '✅ Hidden trigger removed!' as status;
