-- GRANT PUBLIC ACCESS FOR TESTING
-- This will allow the anon key to access the tables

-- Grant permissions to authenticated users
GRANT ALL ON course_progress TO authenticated;
GRANT ALL ON course_lesson_progress TO authenticated;

-- Grant permissions to anon users (for testing)
GRANT ALL ON course_progress TO anon;
GRANT ALL ON course_lesson_progress TO anon;

-- Grant usage on sequences (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('course_progress', 'course_lesson_progress')
ORDER BY table_name, grantee;
