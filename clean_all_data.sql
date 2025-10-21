-- CLEAN SLATE: Delete all existing data and recreate tables with correct structure

-- Step 1: Drop all tables to recreate with correct schema
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create user_profiles table with auth.uid() as primary reference
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL, -- This will store auth.uid()
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  college_name TEXT,
  course TEXT,
  branch TEXT,
  year TEXT,
  semester TEXT,
  programming_languages TEXT[] DEFAULT '{}',
  learning_goals TEXT[] DEFAULT '{}',
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_setup_step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create notes table with direct auth.uid() reference
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL, -- Direct reference to auth.uid()
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  format TEXT DEFAULT 'plain' CHECK (format IN ('plain', 'html', 'markdown')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create other tables
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL, -- Direct reference to auth.uid()
  course_id TEXT NOT NULL,
  completed_chapters TEXT[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  total_time_spent INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL, -- Direct reference to auth.uid()
  quiz_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_subject ON notes(subject);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);

-- Step 7: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS Policies using auth.uid() directly
-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notes Policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (user_id = auth.uid());

-- User Progress Policies
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own progress" ON user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Quiz Results Policies
CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Step 9: Verify tables are created correctly
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'notes' as table_name, COUNT(*) as record_count FROM notes
UNION ALL
SELECT 'user_progress' as table_name, COUNT(*) as record_count FROM user_progress
UNION ALL
SELECT 'quiz_results' as table_name, COUNT(*) as record_count FROM quiz_results;

-- All should show 0 records but tables should exist