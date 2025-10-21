-- ============================================
-- PRACTICE MCQ QUESTIONS - SIMPLE SCHEMA
-- ============================================
-- Super simple table to store MCQ questions

-- Create questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES practice_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS (make it public readable like other tables)
ALTER TABLE practice_questions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON practice_questions TO anon, authenticated;

-- Create index for faster queries
CREATE INDEX idx_practice_questions_topic ON practice_questions(topic_id);

-- ============================================
-- SAMPLE QUESTIONS - Operating Systems
-- ============================================
-- Just to show you the format!

INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'What is the primary function of an Operating System?',
  'To manage computer hardware and software resources',
  'To browse the internet',
  'To edit documents',
  'To play games',
  'A',
  'The OS manages all hardware and software resources, providing services for computer programs.'
FROM practice_topics WHERE title = 'Operating Systems';

INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Which of the following is NOT a type of operating system?',
  'Batch Operating System',
  'Real-time Operating System',
  'Network Operating System',
  'Gaming Operating System',
  'D',
  'Gaming Operating System is not a recognized type. The main types are Batch, Real-time, Distributed, Network, and Mobile OS.'
FROM practice_topics WHERE title = 'Operating Systems';

INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'What is a process in operating systems?',
  'A program in execution',
  'A type of memory',
  'A hardware component',
  'A file format',
  'A',
  'A process is an instance of a program that is being executed. It contains the program code and its current activity.'
FROM practice_topics WHERE title = 'Operating Systems';

-- ============================================
-- HOW TO ADD YOUR QUESTIONS
-- ============================================
-- Just copy this template and fill in your questions:

/*
INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Your question here?',
  'Option A text',
  'Option B text',
  'Option C text',
  'Option D text',
  'A',  -- Change to A, B, C, or D
  'Explanation here (optional)'
FROM practice_topics WHERE title = 'Operating Systems';  -- Change topic name as needed
*/

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Total Questions:', COUNT(*) FROM practice_questions;
SELECT * FROM practice_questions ORDER BY created_at DESC;
