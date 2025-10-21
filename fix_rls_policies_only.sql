-- SIMPLE RLS POLICY FIX
-- This will fix the 403 Forbidden errors

-- ===================================
-- DROP ALL EXISTING POLICIES
-- ===================================
DROP POLICY IF EXISTS "Users can view own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can insert own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can delete own course progress" ON course_progress;

DROP POLICY IF EXISTS "Users can view own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON course_lesson_progress;

-- ===================================
-- ENABLE RLS (if not already enabled)
-- ===================================
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;

-- ===================================
-- CREATE PERMISSIVE RLS POLICIES
-- ===================================

-- Course Progress Policies - Allow authenticated users full access to their own data
CREATE POLICY "course_progress_select_policy"
ON course_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "course_progress_insert_policy"
ON course_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_update_policy"
ON course_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_delete_policy"
ON course_progress FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Lesson Progress Policies - Allow authenticated users full access to their own data
CREATE POLICY "lesson_progress_select_policy"
ON course_lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "lesson_progress_insert_policy"
ON course_lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "lesson_progress_update_policy"
ON course_lesson_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================
-- VERIFY POLICIES ARE CREATED
-- ===================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('course_progress', 'course_lesson_progress')
ORDER BY tablename, policyname;
