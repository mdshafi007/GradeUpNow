-- =====================================================
-- SIMPLE PROGRESS TRACKING SETUP - RUN THIS FIRST
-- =====================================================
-- Copy this entire file and run it in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing tables if any
DROP TABLE IF EXISTS course_lesson_progress CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;

-- Step 2: Create course_progress table
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

-- Step 3: Create course_lesson_progress table
CREATE TABLE course_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  lesson_index INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, section_id, lesson_index)
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_course_progress_user_course ON course_progress(user_id, course_id);
CREATE INDEX idx_lesson_progress_user_course ON course_lesson_progress(user_id, course_id);
CREATE INDEX idx_lesson_progress_lookup ON course_lesson_progress(user_id, course_id, section_id, lesson_index);

-- Step 5: Enable Row Level Security
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies for course_progress
CREATE POLICY "Allow users to view own course progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own course progress"
  ON course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own course progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own course progress"
  ON course_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Create RLS Policies for course_lesson_progress
CREATE POLICY "Allow users to view own lesson progress"
  ON course_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own lesson progress"
  ON course_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own lesson progress"
  ON course_lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Create trigger function to auto-update course progress
CREATE OR REPLACE FUNCTION update_course_progress_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE course_progress
  SET 
    completed_lessons = (
      SELECT COUNT(*) 
      FROM course_lesson_progress 
      WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id
    ),
    progress_percentage = (
      SELECT (COUNT(*)::DECIMAL / NULLIF(total_lessons, 0) * 100)
      FROM course_lesson_progress 
      WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS trigger_update_course_progress ON course_lesson_progress;
CREATE TRIGGER trigger_update_course_progress
  AFTER INSERT ON course_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_stats();

-- =====================================================
-- DONE! Tables created successfully
-- =====================================================
-- You can now test by running:
-- SELECT * FROM course_progress;
-- SELECT * FROM course_lesson_progress;
-- =====================================================
