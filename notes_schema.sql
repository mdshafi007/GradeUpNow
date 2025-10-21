-- GradeUpNow Notes Feature - Supabase Database Schema
-- This schema creates tables for notes and categories with proper RLS policies

-- =====================================================
-- NOTES CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notes_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#FF7700', -- Hex color code
  icon VARCHAR(50) DEFAULT 'folder', -- Icon name for UI
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT notes_categories_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT notes_categories_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  
  -- Unique constraint for user + name combination
  UNIQUE(user_id, name)
);

-- =====================================================
-- NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES notes_categories(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}', -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT notes_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT notes_content_length CHECK (char_length(content) <= 100000) -- Max 100KB content
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Notes categories indexes
CREATE INDEX IF NOT EXISTS idx_notes_categories_user_id ON notes_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_categories_created_at ON notes_categories(created_at DESC);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE notes_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Notes Categories Policies
CREATE POLICY "Users can view their own categories" ON notes_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON notes_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON notes_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON notes_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Notes Policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_notes_categories_updated_at
  BEFORE UPDATE ON notes_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEFAULT CATEGORIES FOR NEW USERS
-- =====================================================

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for new user
  INSERT INTO notes_categories (user_id, name, color, icon, description) VALUES
    (NEW.id, 'General', '#FF7700', 'folder', 'Default category for general notes'),
    (NEW.id, 'Programming', '#3B82F6', 'code', 'Notes related to programming and coding'),
    (NEW.id, 'Study', '#10B981', 'book-open', 'Academic study notes'),
    (NEW.id, 'Ideas', '#F59E0B', 'lightbulb', 'Random ideas and thoughts'),
    (NEW.id, 'Personal', '#8B5CF6', 'user', 'Personal notes and reminders');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default categories when user signs up
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View for notes with category information
CREATE OR REPLACE VIEW notes_with_categories AS
SELECT 
  n.id,
  n.user_id,
  n.category_id,
  n.title,
  n.content,
  n.is_favorite,
  n.is_pinned,
  n.tags,
  n.created_at,
  n.updated_at,
  c.name as category_name,
  c.color as category_color,
  c.icon as category_icon
FROM notes n
LEFT JOIN notes_categories c ON n.category_id = c.id;

-- View for user notes statistics
CREATE OR REPLACE VIEW user_notes_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notes,
  COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) as favorite_notes,
  COUNT(CASE WHEN is_pinned = TRUE THEN 1 END) as pinned_notes,
  COUNT(CASE WHEN category_id IS NULL THEN 1 END) as uncategorized_notes,
  MAX(updated_at) as last_updated
FROM notes
GROUP BY user_id;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment the following lines to insert sample data for testing
/*
-- Sample categories (will be created automatically for each user)
-- Sample notes (you can add these manually in the UI)
INSERT INTO notes (user_id, category_id, title, content, tags) VALUES
  ('your-user-id-here', (SELECT id FROM notes_categories WHERE user_id = 'your-user-id-here' AND name = 'Programming'), 
   'React Hooks Guide', 'useState, useEffect, useContext...', ARRAY['react', 'hooks', 'javascript']),
  ('your-user-id-here', (SELECT id FROM notes_categories WHERE user_id = 'your-user-id-here' AND name = 'Study'), 
   'Data Structures', 'Arrays, Linked Lists, Trees...', ARRAY['ds', 'algorithms', 'computer-science']);
*/

-- =====================================================
-- GRANTS FOR AUTHENTICATED USERS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON notes_categories TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT SELECT ON notes_with_categories TO authenticated;
GRANT SELECT ON user_notes_stats TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE notes_categories IS 'Categories/subjects for organizing notes';
COMMENT ON TABLE notes IS 'User notes with title and content';
COMMENT ON COLUMN notes_categories.color IS 'Hex color code for category display';
COMMENT ON COLUMN notes_categories.icon IS 'Icon name for UI display';
COMMENT ON COLUMN notes.tags IS 'Array of tags for better organization';
COMMENT ON COLUMN notes.is_favorite IS 'Mark note as favorite for quick access';
COMMENT ON COLUMN notes.is_pinned IS 'Pin note to top of list';
COMMENT ON VIEW notes_with_categories IS 'Notes joined with category information';
COMMENT ON VIEW user_notes_stats IS 'Statistics about user notes';
