-- DIAGNOSE AND FIX RLS POLICY ISSUES
-- Run this in Supabase SQL Editor

-- ===================================
-- STEP 1: Check your current user ID
-- ===================================
SELECT auth.uid() as current_user_id;

-- ===================================
-- STEP 2: Check table structure
-- ===================================
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('course_progress', 'course_lesson_progress')
ORDER BY table_name, ordinal_position;

-- ===================================
-- STEP 3: Check existing policies
-- ===================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_expression,
    with_check::text as check_expression
FROM pg_policies
WHERE tablename IN ('course_progress', 'course_lesson_progress')
ORDER BY tablename, policyname;

-- ===================================
-- STEP 4: DROP ALL EXISTING POLICIES
-- ===================================
DROP POLICY IF EXISTS "Users can view own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can insert own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can delete own course progress" ON course_progress;

DROP POLICY IF EXISTS "Users can view own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON course_lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON course_lesson_progress;

-- ===================================
-- STEP 5: CREATE CORRECT RLS POLICIES
-- ===================================

-- Course Progress Policies
CREATE POLICY "Users can view own course progress"
ON course_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own course progress"
ON course_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own course progress"
ON course_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own course progress"
ON course_progress FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Lesson Progress Policies
CREATE POLICY "Users can view own lesson progress"
ON course_lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lesson progress"
ON course_lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lesson progress"
ON course_lesson_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================
-- STEP 6: VERIFY RLS IS ENABLED
-- ===================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('course_progress', 'course_lesson_progress')
AND schemaname = 'public';

-- If RLS is not enabled, run these:
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;

-- ===================================
-- STEP 7: TEST THE POLICIES
-- ===================================
-- Try to insert a test record (should work)
INSERT INTO course_progress (
    user_id,
    course_id,
    current_section_id,
    current_lesson_index,
    total_lessons,
    completed_lessons,
    progress_percentage
) VALUES (
    auth.uid(),
    'test-course',
    'test-section',
    0,
    10,
    0,
    0
)
ON CONFLICT (user_id, course_id) 
DO UPDATE SET updated_at = NOW()
RETURNING *;

-- Try to read it back (should work)
SELECT * FROM course_progress 
WHERE user_id = auth.uid() 
AND course_id = 'test-course';

-- Clean up test data
DELETE FROM course_progress 
WHERE course_id = 'test-course' 
AND user_id = auth.uid();

-- ===================================
-- VERIFICATION COMPLETE
-- ===================================
SELECT '✅ RLS Policies Fixed!' as status;
