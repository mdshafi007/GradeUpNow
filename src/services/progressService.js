/**
 * Progress Service - Handles all tutorial progress operations
 * Designed for scalability and performance
 */

import { supabase } from '../lib/supabase';

/**
 * Get the current user's course progress
 * @param {string} courseId - Course identifier (e.g., 'c-programming')
 * @returns {Promise<Object|null>} Course progress data or null if not found
 */
export const getCourseProgress = async (courseId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 getCourseProgress - User:', user ? 'Logged in' : 'NOT logged in', user?.id);
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    }
    
    if (!user) {
      console.log('⚠️ User not authenticated - skipping progress fetch');
      return null; // User not logged in
    }

    console.log('📊 Fetching progress for course:', courseId);
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching course progress:', error);
      return null;
    }

    console.log('✅ Course progress loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in getCourseProgress:', error);
    return null;
  }
};

/**
 * Get all completed lessons for a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Array>} Array of completed lesson objects
 */
export const getCompletedLessons = async (courseId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('📚 getCompletedLessons - User:', user ? 'Logged in' : 'NOT logged in');
    
    if (!user) {
      console.log('⚠️ User not authenticated - returning empty array');
      return [];
    }

    console.log('📖 Fetching completed lessons for:', courseId);
    const { data, error } = await supabase
      .from('course_lesson_progress')
      .select('section_id, lesson_index')
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (error) {
      console.error('❌ Error fetching completed lessons:', error);
      return [];
    }

    console.log('✅ Completed lessons loaded:', data?.length || 0, 'lessons');
    return data || [];
  } catch (error) {
    console.error('❌ Error in getCompletedLessons:', error);
    return [];
  }
};

/**
 * Check if a specific lesson is completed
 * @param {string} courseId - Course identifier
 * @param {string} sectionId - Section identifier
 * @param {number} lessonIndex - Lesson index within the section
 * @returns {Promise<boolean>} True if lesson is completed
 */
export const isLessonCompleted = async (courseId, sectionId, lessonIndex) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('course_lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('section_id', sectionId)
      .eq('lesson_index', lessonIndex)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking lesson completion:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isLessonCompleted:', error);
    return false;
  }
};

/**
 * Initialize or get course progress for a user
 * @param {string} courseId - Course identifier
 * @param {number} totalLessons - Total number of lessons in the course
 * @returns {Promise<Object|null>} Course progress object
 */
export const initializeCourseProgress = async (courseId, totalLessons) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Check if progress already exists
    const existing = await getCourseProgress(courseId);
    if (existing) {
      return existing;
    }

    // Create new progress record
    const { data, error } = await supabase
      .from('course_progress')
      .insert({
        user_id: user.id,
        course_id: courseId,
        total_lessons: totalLessons,
        completed_lessons: 0,
        progress_percentage: 0,
        current_section_id: null,
        current_lesson_index: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error initializing course progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in initializeCourseProgress:', error);
    return null;
  }
};

/**
 * Mark a lesson as complete and update course progress
 * @param {string} courseId - Course identifier
 * @param {string} sectionId - Section identifier
 * @param {number} lessonIndex - Lesson index within the section
 * @param {number} totalLessons - Total lessons in course
 * @param {string} currentSectionId - Current section ID (for resume feature)
 * @param {number} currentLessonIndex - Current lesson index (for resume feature)
 * @returns {Promise<boolean>} True if successful
 */
export const markLessonComplete = async (
  courseId,
  sectionId,
  lessonIndex,
  totalLessons,
  currentSectionId,
  currentLessonIndex
) => {
  try {
    console.log('💾 markLessonComplete called:', { courseId, sectionId, lessonIndex });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ Cannot save - user not logged in');
      return false;
    }

    console.log('✅ User authenticated:', user.id);
    console.log('🔄 Initializing course progress...');
    
    // Initialize course progress if it doesn't exist
    await initializeCourseProgress(courseId, totalLessons);

    console.log('📝 Saving lesson completion...');
    // Insert lesson completion (upsert to avoid duplicates)
    const { error: lessonError } = await supabase
      .from('course_lesson_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        section_id: sectionId,
        lesson_index: lessonIndex,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id,section_id,lesson_index'
      });

    if (lessonError) {
      console.error('❌ Error marking lesson complete:', lessonError);
      return false;
    }

    console.log('✅ Lesson marked complete!');
    console.log('🔄 Updating course progress...');

    // Update course progress with current position
    const { error: progressError } = await supabase
      .from('course_progress')
      .update({
        current_section_id: currentSectionId,
        current_lesson_index: currentLessonIndex,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (progressError) {
      console.error('❌ Error updating course progress:', progressError);
      return false;
    }

    console.log('✅ Progress saved successfully! 🎉');
    return true;
  } catch (error) {
    console.error('❌ Error in markLessonComplete:', error);
    return false;
  }
};

/**
 * Get user progress summary (for dashboard/analytics)
 * @returns {Promise<Array>} Array of all course progress for the user
 */
export const getUserProgressSummary = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress summary:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserProgressSummary:', error);
    return [];
  }
};

/**
 * Reset progress for a specific course (useful for re-taking courses)
 * @param {string} courseId - Course identifier
 * @returns {Promise<boolean>} True if successful
 */
export const resetCourseProgress = async (courseId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Delete all lesson progress for this course
    const { error: lessonError } = await supabase
      .from('course_lesson_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (lessonError) {
      console.error('Error deleting lesson progress:', lessonError);
      return false;
    }

    // Delete course progress
    const { error: courseError } = await supabase
      .from('course_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (courseError) {
      console.error('Error deleting course progress:', courseError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in resetCourseProgress:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is logged in
 */
export const isUserAuthenticated = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
