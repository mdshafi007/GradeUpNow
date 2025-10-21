// Database helper functions for GradeUpNow
// This file contains utility functions to interact with the Supabase database

import { supabase } from '../lib/supabase'

// =====================================================
// PROFILE OPERATIONS
// =====================================================

/**
 * Get user profile with skills and interests
 * @param {string} userId - The user ID
 * @returns {Object} User profile with skills and interests
 */
export const getUserProfile = async (userId) => {
  try {
    // Get basic profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    // If no profile exists, return null data (first time user)
    if (!profile) {
      return { data: null, error: null }
    }

    // Get user skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skills (
          id,
          name,
          category
        )
      `)
      .eq('user_id', userId)

    // Get user interests  
    const { data: userInterests, error: interestsError } = await supabase
      .from('user_interests')
      .select(`
        interests (
          id,
          name
        ),
        priority
      `)
      .eq('user_id', userId)

    // Combine the data
    const completeProfile = {
      ...profile,
      skills: userSkills?.map(us => us.skills) || [],
      interests: userInterests?.map(ui => ui.interests) || []
    }

    return { data: completeProfile, error: null }
  } catch (error) {
    // Silently handle database connection issues for profile loading
    return { data: null, error }
  }
}

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.fullName,
        year: parseInt(profileData.year),
        semester: parseInt(profileData.semester),
        college: profileData.college,
        custom_college: profileData.college === 'Other' ? profileData.customCollege : null,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        linkedin_url: profileData.linkedinUrl,
        github_url: profileData.githubUrl,
        portfolio_url: profileData.portfolioUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error }
  }
}

/**
 * Create or update user profile (upsert)
 * @param {string} userId - The user ID
 * @param {Object} profileData - Profile data
 * @returns {Object} Profile data
 */
export const upsertUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profileData.fullName,
        email: profileData.email,
        year: parseInt(profileData.year),
        semester: parseInt(profileData.semester),
        college: profileData.college,
        custom_college: profileData.college === 'Other' ? profileData.customCollege : null,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        linkedin_url: profileData.linkedinUrl,
        github_url: profileData.githubUrl,
        portfolio_url: profileData.portfolioUrl
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error upserting profile:', error)
    return { data: null, error }
  }
}

// =====================================================
// SKILLS OPERATIONS
// =====================================================

/**
 * Get all available skills
 * @returns {Array} List of available skills
 */
export const getAvailableSkills = async () => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('category, name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    // Silently handle database connection issues - app will use fallback data
    return { data: [], error }
  }
}

/**
 * Update user skills
 * @param {string} userId - The user ID
 * @param {Array} skillNames - Array of skill names
 * @returns {Object} Operation result
 */
export const updateUserSkills = async (userId, skillNames) => {
  try {
    // Always delete existing user skills first
    const { error: deleteError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting existing skills:', deleteError)
      // Don't throw here, continue to insert new ones
    }

    // If no skills to add, return success
    if (!skillNames || skillNames.length === 0) {
      return { success: true, error: null }
    }

    // Get skill IDs from names
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, name')
      .in('name', skillNames)

    if (skillsError) throw skillsError

    // Insert new user skills if any found
    if (skills && skills.length > 0) {
      const userSkills = skills.map(skill => ({
        user_id: userId,
        skill_id: skill.id,
        proficiency_level: 'beginner' // Default level
      }))

      const { error: insertError } = await supabase
        .from('user_skills')
        .insert(userSkills)

      if (insertError) throw insertError
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user skills:', error)
    return { success: false, error }
  }
}

/**
 * Get user skills
 * @param {string} userId - The user ID
 * @returns {Array} User skills with details
 */
export const getUserSkills = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills (
          id,
          name,
          category,
          color
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user skills:', error)
    return { data: [], error }
  }
}

// =====================================================
// INTERESTS OPERATIONS
// =====================================================

/**
 * Get all available interests
 * @returns {Array} List of available interests
 */
export const getAvailableInterests = async () => {
  try {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    // Silently handle database connection issues - app will use fallback data
    return { data: [], error }
  }
}

/**
 * Update user interests
 * @param {string} userId - The user ID
 * @param {Array} interestNames - Array of interest names
 * @returns {Object} Operation result
 */
export const updateUserInterests = async (userId, interestNames) => {
  try {
    // Always delete existing user interests first
    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting existing interests:', deleteError)
      // Don't throw here, continue to insert new ones
    }

    // If no interests to add, return success
    if (!interestNames || interestNames.length === 0) {
      return { success: true, error: null }
    }

    // Get interest IDs from names
    const { data: interests, error: interestsError } = await supabase
      .from('interests')
      .select('id, name')
      .in('name', interestNames)

    if (interestsError) throw interestsError

    // Insert new user interests if any found
    if (interests && interests.length > 0) {
      const userInterests = interests.map((interest, index) => ({
        user_id: userId,
        interest_id: interest.id,
        priority: index + 1 // Set priority based on order
      }))

      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(userInterests)

      if (insertError) throw insertError
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user interests:', error)
    return { success: false, error }
  }
}

/**
 * Get user interests
 * @param {string} userId - The user ID
 * @returns {Array} User interests with details
 */
export const getUserInterests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_interests')
      .select(`
        *,
        interests (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .order('priority')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return { data: [], error }
  }
}

// =====================================================
// COURSE OPERATIONS
// =====================================================

/**
 * Get all published courses
 * @param {Object} filters - Optional filters (category, level)
 * @returns {Array} List of courses
 */
export const getCourses = async (filters = {}) => {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.level) {
      query = query.eq('level', filters.level)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return { data: [], error }
  }
}

/**
 * Get user's course progress
 * @param {string} userId - The user ID
 * @returns {Array} User's course progress
 */
export const getUserCourseProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        courses (
          id,
          title,
          thumbnail_url,
          level,
          category
        )
      `)
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return { data: [], error }
  }
}

/**
 * Update course progress
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 * @param {number} progressPercentage - Progress percentage (0-100)
 * @returns {Object} Updated progress
 */
export const updateCourseProgress = async (userId, courseId, progressPercentage) => {
  try {
    const updateData = {
      user_id: userId,
      course_id: courseId,
      progress_percentage: Math.min(Math.max(progressPercentage, 0), 100),
      last_accessed_at: new Date().toISOString()
    }

    // Mark as completed if 100%
    if (progressPercentage >= 100) {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(updateData)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating course progress:', error)
    return { data: null, error }
  }
}

// =====================================================
// NOTIFICATION OPERATIONS
// =====================================================

/**
 * Get user notifications
 * @param {string} userId - The user ID
 * @param {boolean} unreadOnly - Get only unread notifications
 * @returns {Array} User notifications
 */
export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { data: [], error }
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Object} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { data: null, error }
  }
}

/**
 * Create notification
 * @param {string} userId - The user ID
 * @param {Object} notificationData - Notification data
 * @returns {Object} Created notification
 */
export const createNotification = async (userId, notificationData) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        action_url: notificationData.actionUrl
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { data: null, error }
  }
}

// =====================================================
// ANALYTICS OPERATIONS
// =====================================================

/**
 * Get user dashboard analytics
 * @param {string} userId - The user ID
 * @returns {Object} User dashboard data
 */
export const getUserDashboard = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_course_dashboard')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user dashboard:', error)
    return { data: null, error }
  }
}

// =====================================================
// NOTES OPERATIONS
// =====================================================

/**
 * Get all notes categories for a user
 * @param {string} userId - The user ID
 * @returns {Array} List of categories
 */
export const getNotesCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notes_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching notes categories:', error)
    return { data: [], error }
  }
}

/**
 * Create a new notes category
 * @param {string} userId - The user ID
 * @param {Object} categoryData - Category data
 * @returns {Object} Created category
 */
export const createNotesCategory = async (userId, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('notes_categories')
      .insert({
        user_id: userId,
        name: categoryData.name,
        color: categoryData.color || '#FF7700',
        icon: categoryData.icon || 'folder',
        description: categoryData.description
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating notes category:', error)
    return { data: null, error }
  }
}

/**
 * Update a notes category
 * @param {string} categoryId - The category ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated category
 */
export const updateNotesCategory = async (categoryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('notes_categories')
      .update({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        description: updates.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating notes category:', error)
    return { data: null, error }
  }
}

/**
 * Delete a notes category
 * @param {string} categoryId - The category ID
 * @returns {Object} Operation result
 */
export const deleteNotesCategory = async (categoryId) => {
  try {
    const { error } = await supabase
      .from('notes_categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting notes category:', error)
    return { success: false, error }
  }
}

/**
 * Get all notes for a user with optional filtering
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters (categoryId, search, favorites, pinned)
 * @returns {Array} List of notes with category information
 */
export const getNotes = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('notes_with_categories')
      .select('*')
      .eq('user_id', userId)

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.favorites) {
      query = query.eq('is_favorite', true)
    }

    if (filters.pinned) {
      query = query.eq('is_pinned', true)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    // Order by pinned first, then favorites, then updated_at
    query = query.order('is_pinned', { ascending: false })
                 .order('is_favorite', { ascending: false })
                 .order('updated_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching notes:', error)
    return { data: [], error }
  }
}

/**
 * Get a single note by ID
 * @param {string} noteId - The note ID
 * @returns {Object} Note with category information
 */
export const getNote = async (noteId) => {
  try {
    const { data, error } = await supabase
      .from('notes_with_categories')
      .select('*')
      .eq('id', noteId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching note:', error)
    return { data: null, error }
  }
}

/**
 * Create a new note
 * @param {string} userId - The user ID
 * @param {Object} noteData - Note data
 * @returns {Object} Created note
 */
export const createNote = async (userId, noteData) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        category_id: noteData.categoryId || null,
        title: noteData.title,
        content: noteData.content || '',
        tags: noteData.tags || [],
        is_favorite: noteData.isFavorite || false,
        is_pinned: noteData.isPinned || false
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating note:', error)
    return { data: null, error }
  }
}

/**
 * Update a note
 * @param {string} noteId - The note ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated note
 */
export const updateNote = async (noteId, updates) => {
  try {
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating note:', error)
    return { data: null, error }
  }
}

/**
 * Delete a note
 * @param {string} noteId - The note ID
 * @returns {Object} Operation result
 */
export const deleteNote = async (noteId) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting note:', error)
    return { success: false, error }
  }
}

/**
 * Get user notes statistics
 * @param {string} userId - The user ID
 * @returns {Object} Notes statistics
 */
export const getNotesStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_notes_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching notes stats:', error)
    return { data: null, error }
  }
}

/**
 * Search notes by content
 * @param {string} userId - The user ID
 * @param {string} searchTerm - Search term
 * @returns {Array} Matching notes
 */
export const searchNotes = async (userId, searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('notes_with_categories')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching notes:', error)
    return { data: [], error }
  }
}

// Export all functions
export default {
  // Profile operations
  getUserProfile,
  updateUserProfile,
  upsertUserProfile,
  
  // Skills operations
  getAvailableSkills,
  updateUserSkills,
  getUserSkills,
  
  // Interests operations
  getAvailableInterests,
  updateUserInterests,
  getUserInterests,
  
  // Course operations
  getCourses,
  getUserCourseProgress,
  updateCourseProgress,
  
  // Notification operations
  getUserNotifications,
  markNotificationAsRead,
  createNotification,
  
  // Analytics
  getUserDashboard,
  
  // Notes operations
  getNotesCategories,
  createNotesCategory,
  updateNotesCategory,
  deleteNotesCategory,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNotesStats,
  searchNotes
}