-- ============================================
-- FIX RLS POLICIES - Allow Public Read Access
-- ============================================
-- Run this in Supabase SQL Editor

-- First, drop the existing policies
DROP POLICY IF EXISTS "Anyone can view practice categories" ON practice_categories;
DROP POLICY IF EXISTS "Anyone can view active practice topics" ON practice_topics;

-- Recreate policies with proper anonymous access
-- For authenticated AND anonymous users
CREATE POLICY "Public read access for practice categories"
  ON practice_categories FOR SELECT
  USING (true);

CREATE POLICY "Public read access for active practice topics"
  ON practice_topics FOR SELECT
  USING (is_active = true);

-- Verify RLS is enabled
ALTER TABLE practice_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_topics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVE: If above doesn't work, disable RLS completely
-- ============================================
-- Uncomment these lines if you still have issues:

-- ALTER TABLE practice_categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE practice_topics DISABLE ROW LEVEL SECURITY;
