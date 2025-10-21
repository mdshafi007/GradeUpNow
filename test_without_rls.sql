-- TEMPORARY TEST: DISABLE RLS TO SEE IF THAT'S THE PROBLEM
-- This will help us diagnose if the issue is with RLS policies or something else

-- ===================================
-- STEP 1: Temporarily disable RLS
-- ===================================
ALTER TABLE course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress DISABLE ROW LEVEL SECURITY;

-- ===================================
-- STEP 2: Verify RLS is disabled
-- ===================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('course_progress', 'course_lesson_progress');
-- Should show: rls_enabled = false

-- ===================================
-- NOW TEST YOUR APP
-- Go to your tutorial page and click Next
-- If it works now, then the problem is with the RLS policies
-- If it still doesn't work, the problem is elsewhere
-- ===================================

-- ===================================
-- STEP 3: After testing, re-enable RLS
-- (Run this after you've tested the app)
-- ===================================
-- ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;
