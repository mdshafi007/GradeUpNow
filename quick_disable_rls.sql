-- QUICK TEST: Disable RLS and verify

-- Disable RLS
ALTER TABLE course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('course_progress', 'course_lesson_progress')
AND schemaname = 'public';
