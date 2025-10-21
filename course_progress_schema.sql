-- =====================================================
-- TUTORIAL PROGRESS TRACKING SCHEMA FOR SUPABASE
-- =====================================================
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS course_lesson_progress CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;

-- Table 1: Course Progress Overview
-- Stores high-level progress for each user per course
-- =====================================================
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  current_section_id TEXT,
  current_lesson_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Table 2: Individual Lesson Completion
-- Stores granular completion data for each lesson
-- =====================================================
CREATE TABLE course_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  lesson_index INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, section_id, lesson_index)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- These indexes ensure fast queries even with millions of records

-- Index for fetching user's course progress
CREATE INDEX idx_course_progress_user_course 
  ON course_progress(user_id, course_id);

-- Index for fetching user's lesson progress
CREATE INDEX idx_lesson_progress_user_course 
  ON course_lesson_progress(user_id, course_id);

-- Index for finding specific lesson completion
CREATE INDEX idx_lesson_progress_lookup 
  ON course_lesson_progress(user_id, course_id, section_id, lesson_index);

-- Index for recently updated courses (for analytics/dashboards)
CREATE INDEX idx_course_progress_updated 
  ON course_progress(user_id, updated_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Ensures users can only access their own progress data

-- Enable RLS on both tables
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies for course_progress table
CREATE POLICY "Users can view own course progress" 
  ON course_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" 
  ON course_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" 
  ON course_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own course progress" 
  ON course_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for course_lesson_progress table
CREATE POLICY "Users can view own lesson progress" 
  ON course_lesson_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress" 
  ON course_lesson_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson progress" 
  ON course_lesson_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Update Course Progress
-- =====================================================
-- This function automatically recalculates progress percentages
-- Call this after inserting lesson progress

CREATE OR REPLACE FUNCTION update_course_progress_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the course progress stats when a lesson is completed
  UPDATE course_progress
  SET 
    completed_lessons = (
      SELECT COUNT(*) 
      FROM course_lesson_progress 
      WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id
    ),
    progress_percentage = (
      SELECT (COUNT(*)::DECIMAL / total_lessons * 100)
      FROM course_lesson_progress 
      WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update course progress when lesson is completed
CREATE TRIGGER trigger_update_course_progress
  AFTER INSERT ON course_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_stats();

-- =====================================================
-- USAGE NOTES:
-- =====================================================
-- 1. Run this entire SQL file in Supabase SQL Editor
-- 2. Tables will be created with proper indexes and security
-- 3. Row Level Security ensures data privacy
-- 4. Trigger automatically updates course progress percentages
-- 5. All timestamps are stored in UTC with timezone support
-- =====================================================

-- Example Query: Get user's course progress
-- SELECT * FROM course_progress WHERE user_id = auth.uid();

-- Example Query: Get completed lessons for a course
-- SELECT * FROM course_lesson_progress 
-- WHERE user_id = auth.uid() AND course_id = 'c-programming';

-- Example Query: Check if specific lesson is completed
-- SELECT EXISTS (
--   SELECT 1 FROM course_lesson_progress 
--   WHERE user_id = auth.uid() 
--     AND course_id = 'c-programming'
--     AND section_id = 'section-0'
--     AND lesson_index = 2
-- );
