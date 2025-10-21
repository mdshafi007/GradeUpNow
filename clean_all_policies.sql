-- CLEAN ALL POLICIES AND START FRESH
-- This removes ALL policies and creates only the correct ones

-- ===================================
-- DROP ALL POLICIES (both old and new)
-- ===================================
DROP POLICY IF EXISTS "Allow users to delete own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Allow users to insert own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Allow users to view own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_insert_policy" ON course_lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_select_policy" ON course_lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_update_policy" ON course_lesson_progress;

DROP POLICY IF EXISTS "Allow users to delete own course progress" ON course_progress;
DROP POLICY IF EXISTS "Allow users to insert own course progress" ON course_progress;
DROP POLICY IF EXISTS "Allow users to update own course progress" ON course_progress;
DROP POLICY IF EXISTS "Allow users to view own course progress" ON course_progress;
DROP POLICY IF EXISTS "course_progress_delete_policy" ON course_progress;
DROP POLICY IF EXISTS "course_progress_insert_policy" ON course_progress;
DROP POLICY IF EXISTS "course_progress_select_policy" ON course_progress;
DROP POLICY IF EXISTS "course_progress_update_policy" ON course_progress;

-- ===================================
-- VERIFY ALL POLICIES ARE GONE
-- ===================================
SELECT 
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('course_progress', 'course_lesson_progress');
-- Should return 0 rows

-- ===================================
-- CREATE ONLY THE CORRECT POLICIES
-- ===================================

-- Course Progress Table
CREATE POLICY "course_progress_select"
ON course_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "course_progress_insert"
ON course_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_update"
ON course_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_progress_delete"
ON course_progress FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Lesson Progress Table
CREATE POLICY "lesson_progress_select"
ON course_lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "lesson_progress_insert"
ON course_lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "lesson_progress_update"
ON course_lesson_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================
-- VERIFY ONLY 7 POLICIES EXIST NOW
-- ===================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('course_progress', 'course_lesson_progress')
ORDER BY tablename, policyname;
-- Should return exactly 7 rows, all with {authenticated} role
