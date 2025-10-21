-- ============================================
-- NUCLEAR OPTION: Complete Permission Reset
-- ============================================
-- This removes ALL restrictions and makes tables fully public

-- 1. DISABLE RLS completely
ALTER TABLE practice_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_topics DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view practice categories" ON practice_categories;
DROP POLICY IF EXISTS "Anyone can view active practice topics" ON practice_topics;
DROP POLICY IF EXISTS "Public read access for practice categories" ON practice_categories;
DROP POLICY IF EXISTS "Public read access for active practice topics" ON practice_topics;

-- 3. Grant SELECT permissions to everyone (anon + authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON practice_categories TO anon, authenticated;
GRANT SELECT ON practice_topics TO anon, authenticated;

-- 4. Verify the data is there
SELECT 'Categories:', COUNT(*) FROM practice_categories;
SELECT 'Topics:', COUNT(*) FROM practice_topics;

-- 5. Show all data
SELECT * FROM practice_categories ORDER BY order_index;
SELECT * FROM practice_topics ORDER BY order_index;
