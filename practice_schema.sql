-- ============================================
-- PRACTICE FEATURE - SIMPLE & CLEAN SCHEMA
-- ============================================
-- Just 2 tables: categories and topics
-- Easy to manage from Supabase dashboard!

-- Table 1: Practice Categories (Programming, Practice Tests)
CREATE TABLE IF NOT EXISTS practice_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Practice Topics (DSA, OS, DBMS, etc.)
CREATE TABLE IF NOT EXISTS practice_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES practice_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  icon TEXT,
  color TEXT DEFAULT '#3B82F6', -- Card color
  total_questions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE practice_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_topics ENABLE ROW LEVEL SECURITY;

-- Allow everyone to READ (students can see topics)
CREATE POLICY "Anyone can view practice categories"
  ON practice_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view active practice topics"
  ON practice_topics FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX idx_practice_topics_category ON practice_topics(category_id);
CREATE INDEX idx_practice_topics_active ON practice_topics(is_active);

-- ============================================
-- INITIAL DATA - Programming & Practice Tests
-- ============================================

-- Insert Categories
INSERT INTO practice_categories (name, slug, description, icon, order_index)
VALUES 
  ('Programming', 'programming', 'Test your programming skills with coding challenges', '💻', 1),
  ('Practice Tests', 'practice-tests', 'Improve your skills with comprehensive practice tests and challenges', '📝', 2);

-- Insert Topics
-- Programming Topics
INSERT INTO practice_topics (category_id, title, description, difficulty, icon, color, total_questions, order_index)
SELECT 
  id,
  'DSA Practice',
  'Data Structures and Algorithms - Arrays, Linked Lists, Trees, Graphs, and more',
  'MEDIUM',
  '🎯',
  '#F59E0B',
  0,
  1
FROM practice_categories WHERE slug = 'programming';

-- Practice Test Topics
INSERT INTO practice_topics (category_id, title, description, difficulty, icon, color, total_questions, order_index)
SELECT 
  id,
  'Operating Systems',
  'Process Management, Memory Management, File Systems, and Synchronization',
  'EASY',
  '💾',
  '#10B981',
  0,
  1
FROM practice_categories WHERE slug = 'practice-tests';

INSERT INTO practice_topics (category_id, title, description, difficulty, icon, color, total_questions, order_index)
SELECT 
  id,
  'Database Management',
  'SQL, Normalization, Transactions, Indexing, and Query Optimization',
  'EASY',
  '🗄️',
  '#3B82F6',
  0,
  2
FROM practice_categories WHERE slug = 'practice-tests';

-- ============================================
-- HOW TO USE:
-- ============================================
-- 1. Run this entire SQL in Supabase SQL Editor
-- 2. To add a new topic, just INSERT into practice_topics:
--
--    INSERT INTO practice_topics (category_id, title, description, difficulty, icon, color, order_index)
--    SELECT id, 'Computer Networks', 'OSI Model, TCP/IP, Routing', 'MEDIUM', '🌐', '#8B5CF6', 1
--    FROM practice_categories WHERE slug = 'practice-tests';
--
-- 3. That's it! Refresh your app and the new card appears!
-- ============================================
