-- GradeUpNow Database Schema
-- This file contains all the SQL commands to set up the complete database schema
-- Run these commands in your Supabase SQL Editor

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Stores user profile information extending Supabase auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    year INTEGER CHECK (year >= 1 AND year <= 4),
    semester INTEGER CHECK (semester >= 1 AND semester <= 2),
    college TEXT NOT NULL,
    custom_college TEXT, -- For "Other" college option
    bio TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with academic and personal information';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id, automatically deleted when user is deleted';
COMMENT ON COLUMN public.profiles.year IS 'Academic year (1-4)';
COMMENT ON COLUMN public.profiles.semester IS 'Current semester (1-2)';
COMMENT ON COLUMN public.profiles.college IS 'College name or "Other"';
COMMENT ON COLUMN public.profiles.custom_college IS 'Custom college name when college="Other"';

-- =====================================================
-- 2. SKILLS TABLE
-- =====================================================
-- Master table for available programming skills
CREATE TABLE public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'programming_language', 'framework', 'tool', 'database'
    description TEXT,
    icon_url TEXT,
    color TEXT, -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add initial skills data
INSERT INTO public.skills (name, category, description, color) VALUES
-- Programming Languages
('JavaScript', 'programming_language', 'Popular web programming language', '#F7DF1E'),
('Python', 'programming_language', 'Versatile programming language', '#3776AB'),
('Java', 'programming_language', 'Enterprise programming language', '#007396'),
('C++', 'programming_language', 'System programming language', '#00599C'),
('C', 'programming_language', 'Low-level programming language', '#A8B9CC'),
-- Frameworks
('React', 'framework', 'JavaScript UI framework', '#61DAFB'),
('Node.js', 'framework', 'JavaScript runtime environment', '#339933'),
-- Web Technologies
('HTML/CSS', 'web_technology', 'Web markup and styling', '#E34F26'),
-- Databases
('SQL', 'database', 'Structured Query Language', '#336791'),
('MongoDB', 'database', 'NoSQL database', '#47A248'),
-- Tools
('Git', 'tool', 'Version control system', '#F05032'),
('Docker', 'tool', 'Containerization platform', '#2496ED');

-- =====================================================
-- 3. INTERESTS TABLE
-- =====================================================
-- Master table for career interests
CREATE TABLE public.interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    color TEXT, -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add initial interests data
INSERT INTO public.interests (name, description, color) VALUES
('Web Development', 'Frontend and backend web development', '#61DAFB'),
('AI/ML', 'Artificial Intelligence and Machine Learning', '#FF6F00'),
('Software Engineer', 'Software development and engineering', '#2196F3'),
('Data Scientist', 'Data analysis and data science', '#4CAF50'),
('Mobile Development', 'iOS and Android app development', '#9C27B0'),
('DevOps', 'Development and Operations integration', '#FF5722'),
('Cybersecurity', 'Information security and cyber defense', '#F44336'),
('Game Development', 'Video game programming and design', '#795548'),
('UI/UX Design', 'User interface and experience design', '#E91E63'),
('Backend Development', 'Server-side development', '#607D8B');

-- =====================================================
-- 4. USER_SKILLS TABLE (Junction Table)
-- =====================================================
-- Many-to-many relationship between users and skills
CREATE TABLE public.user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
    years_of_experience INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent duplicate user-skill combinations
    UNIQUE(user_id, skill_id)
);

COMMENT ON TABLE public.user_skills IS 'Junction table linking users to their programming skills';
COMMENT ON COLUMN public.user_skills.proficiency_level IS 'Skill level: beginner, intermediate, advanced, expert';

-- =====================================================
-- 5. USER_INTERESTS TABLE (Junction Table)
-- =====================================================
-- Many-to-many relationship between users and interests
CREATE TABLE public.user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    interest_id UUID REFERENCES public.interests(id) ON DELETE CASCADE NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=highest priority, 5=lowest
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent duplicate user-interest combinations
    UNIQUE(user_id, interest_id)
);

COMMENT ON TABLE public.user_interests IS 'Junction table linking users to their career interests';

-- =====================================================
-- 6. COURSES TABLE
-- =====================================================
-- Course catalog
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly version of title
    description TEXT,
    thumbnail_url TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    category TEXT NOT NULL, -- 'programming', 'web_development', 'data_science', etc.
    duration_hours INTEGER,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price DECIMAL(10,2) DEFAULT 0.00,
    instructor_name TEXT,
    tags TEXT[], -- Array of tags for searching
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.courses IS 'Course catalog with all available courses';

-- =====================================================
-- 7. USER_PROGRESS TABLE
-- =====================================================
-- Track user progress through courses
CREATE TABLE public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, course_id)
);

COMMENT ON TABLE public.user_progress IS 'Tracks user progress through courses';

-- =====================================================
-- 8. QUIZZES TABLE
-- =====================================================
-- Quiz definitions
CREATE TABLE public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER, -- NULL means no time limit
    passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    max_attempts INTEGER DEFAULT 3, -- NULL means unlimited attempts
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 9. QUIZ_ATTEMPTS TABLE
-- =====================================================
-- Track user quiz attempts and scores
CREATE TABLE public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken_minutes INTEGER,
    passed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    answers JSONB -- Store user answers for review
);

COMMENT ON TABLE public.quiz_attempts IS 'Records of user quiz attempts with scores and answers';

-- =====================================================
-- 10. NOTIFICATIONS TABLE
-- =====================================================
-- User notifications system
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- Optional link for notification action
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for efficient queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at);

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================
-- Create indexes for frequently queried columns
CREATE INDEX idx_profiles_college ON public.profiles(college);
CREATE INDEX idx_profiles_year_semester ON public.profiles(year, semester);
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_published ON public.courses(is_published);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- =====================================================
-- 7.1 USER_LESSON_PROGRESS TABLE (fine-grained progress)
-- =====================================================
-- Stores completion state for individual lessons identified by client-side slugs/ids
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_slug TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, course_slug, lesson_id)
);

COMMENT ON TABLE public.user_lesson_progress IS 'Fine-grained per-lesson completion state keyed by course_slug and lesson_id (derived from content JSON)';

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course ON public.user_lesson_progress(user_id, course_slug);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User skills policies
CREATE POLICY "Users can manage own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- User interests policies
CREATE POLICY "Users can manage own interests" ON public.user_interests
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lesson progress policies (drop-and-create for compatibility)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_lesson_progress' AND policyname = 'Users can view own lesson progress'
  ) THEN
    DROP POLICY "Users can view own lesson progress" ON public.user_lesson_progress;
  END IF;
END $$;
CREATE POLICY "Users can view own lesson progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_lesson_progress' AND policyname = 'Users can insert own lesson progress'
  ) THEN
    DROP POLICY "Users can insert own lesson progress" ON public.user_lesson_progress;
  END IF;
END $$;
CREATE POLICY "Users can insert own lesson progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_lesson_progress' AND policyname = 'Users can update own lesson progress'
  ) THEN
    DROP POLICY "Users can update own lesson progress" ON public.user_lesson_progress;
  END IF;
END $$;
CREATE POLICY "Users can update own lesson progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can manage own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for reference tables
CREATE POLICY "Anyone can read skills" ON public.skills
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read interests" ON public.interests
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read published courses" ON public.courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can read published quizzes" ON public.quizzes
    FOR SELECT USING (is_published = true);

-- =====================================================
-- 13. FUNCTIONS AND TRIGGERS
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quizzes
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update quiz attempt passed status
CREATE OR REPLACE FUNCTION public.update_quiz_attempt_passed()
RETURNS TRIGGER AS $$
DECLARE
    quiz_passing_score INTEGER;
BEGIN
    -- Get the passing score for this quiz
    SELECT passing_score INTO quiz_passing_score
    FROM public.quizzes
    WHERE id = NEW.quiz_id;
    
    -- Update the passed status
    NEW.passed = (NEW.score >= quiz_passing_score);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update quiz attempt passed status
CREATE TRIGGER set_quiz_attempt_passed
    BEFORE INSERT OR UPDATE ON public.quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_quiz_attempt_passed();

-- =====================================================
-- 14. VIEWS FOR COMMON QUERIES
-- =====================================================
-- View to get user profile with skills and interests
CREATE VIEW public.user_profile_complete AS
SELECT 
    p.*,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', s.id,
                'name', s.name,
                'category', s.category,
                'proficiency_level', us.proficiency_level,
                'years_of_experience', us.years_of_experience
            )
        ) FILTER (WHERE s.id IS NOT NULL), 
        '[]'::json
    ) AS skills,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', i.id,
                'name', i.name,
                'priority', ui.priority
            )
        ) FILTER (WHERE i.id IS NOT NULL), 
        '[]'::json
    ) AS interests
FROM public.profiles p
LEFT JOIN public.user_skills us ON p.id = us.user_id
LEFT JOIN public.skills s ON us.skill_id = s.id AND s.is_active = true
LEFT JOIN public.user_interests ui ON p.id = ui.user_id
LEFT JOIN public.interests i ON ui.interest_id = i.id AND i.is_active = true
GROUP BY p.id;

-- View for course progress dashboard
CREATE VIEW public.user_course_dashboard AS
SELECT 
    p.id AS user_id,
    p.full_name,
    COUNT(DISTINCT up.course_id) AS enrolled_courses,
    COUNT(DISTINCT CASE WHEN up.progress_percentage = 100 THEN up.course_id END) AS completed_courses,
    AVG(up.progress_percentage) AS average_progress,
    COUNT(DISTINCT qa.quiz_id) AS quizzes_taken,
    COUNT(DISTINCT CASE WHEN qa.passed THEN qa.quiz_id END) AS quizzes_passed
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.quiz_attempts qa ON p.id = qa.user_id AND qa.completed_at IS NOT NULL
GROUP BY p.id, p.full_name;

-- =====================================================
-- 15. SAMPLE DATA (Optional - Remove in production)
-- =====================================================
-- This section adds sample data for testing
-- Comment out or remove this section before going to production

/*
-- Sample profile data will be created automatically when users sign up
-- Sample course data
INSERT INTO public.courses (title, slug, description, level, category, duration_hours, is_published, instructor_name) VALUES
('JavaScript Fundamentals', 'javascript-fundamentals', 'Learn the basics of JavaScript programming', 'beginner', 'programming', 20, true, 'John Doe'),
('React Development', 'react-development', 'Build modern web applications with React', 'intermediate', 'web_development', 30, true, 'Jane Smith'),
('Python for Data Science', 'python-data-science', 'Use Python for data analysis and machine learning', 'intermediate', 'data_science', 40, true, 'Dr. Mike Johnson');
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Grant necessary permissions (these are usually handled by Supabase automatically)
-- But including them for completeness
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'GradeUpNow database schema created successfully! 🎉' AS status;