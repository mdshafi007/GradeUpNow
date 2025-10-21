-- Quick diagnostic check

-- 1. What columns exist in profiles?
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Are there any custom triggers on auth.users?
SELECT tgname, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%';

-- 3. Check a sample profile
SELECT id, email, full_name FROM public.profiles LIMIT 3;
