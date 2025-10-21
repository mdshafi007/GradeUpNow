-- ============================================
-- QUICK FIX: Disable RLS Temporarily for Testing
-- ============================================
-- Run this in Supabase SQL Editor to test

-- Disable RLS on both tables temporarily
ALTER TABLE practice_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_topics DISABLE ROW LEVEL SECURITY;

-- Now refresh your browser and check if cards appear
-- If they do, then we know it's an RLS policy issue
