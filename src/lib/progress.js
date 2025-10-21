import { getCourseBySlug, updateCourseProgress, markLessonCompleted, getCompletedLessons, ensureCourseBySlug } from './database'

/**
 * Update a user's course progress using a course slug
 * - Resolves course id via slug
 * - Debounces optional external callers at a higher level if needed
 */
export const updateCourseProgressBySlug = async (userId, courseSlug, progressPercentage) => {
  if (!userId || !courseSlug) {
    return { data: null, error: new Error('Missing userId or courseSlug') }
  }

  const { data: course, error: courseErr } = await getCourseBySlug(courseSlug)
  let courseRow = course
  if (courseErr || !courseRow) {
    const ensured = await ensureCourseBySlug(courseSlug)
    if (!ensured?.data) {
      return { data: null, error: courseErr || ensured.error || new Error('Course not found') }
    }
    courseRow = ensured.data
  }

  return await updateCourseProgress(userId, courseRow.id, progressPercentage)
}

export const completeLessonAndUpdate = async (userId, courseSlug, lessonId, progressPercentage, resolveCourseId = false) => {
  if (!userId) return { data: null, error: new Error('Missing userId') }
  await markLessonCompleted(userId, courseSlug, lessonId)
  if (typeof progressPercentage === 'number') {
    if (resolveCourseId) {
      const { data: course } = await getCourseBySlug(courseSlug)
      if (course?.id) return updateCourseProgress(userId, course.id, progressPercentage)
    }
    return updateCourseProgressBySlug(userId, courseSlug, progressPercentage)
  }
  return { data: null, error: null }
}

export const loadCompletedLessons = async (userId, courseSlug) => {
  return getCompletedLessons(userId, courseSlug)
}

export default {
  updateCourseProgressBySlug,
  completeLessonAndUpdate,
  loadCompletedLessons
}


