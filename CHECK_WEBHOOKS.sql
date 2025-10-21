-- ========================================
-- CHECK FOR WEBHOOKS AND HIDDEN TRIGGERS
-- ========================================

-- 1. Check for ALL extensions (webhooks might be extensions)
SELECT * FROM pg_extension;

-- 2. Check for ALL event triggers (not just table triggers)
SELECT * FROM pg_event_trigger;

-- 3. Check for ALL triggers system-wide
SELECT 
    n.nspname as schema,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        WHEN t.tgenabled = 'D' THEN 'DISABLED'
        ELSE 'OTHER'
    END as status,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname IN ('auth', 'public')
ORDER BY n.nspname, c.relname, t.tgname;

-- 4. Check for functions that might be called by triggers
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND (
        p.proname ILIKE '%user%' 
        OR p.proname ILIKE '%profile%'
        OR p.proname ILIKE '%signup%'
    );

-- 5. Check auth.users table specifically
SELECT 
    t.tgname,
    t.tgenabled,
    p.proname,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'auth.users'::regclass;

SELECT '📊 Webhook and trigger analysis complete' as status;
