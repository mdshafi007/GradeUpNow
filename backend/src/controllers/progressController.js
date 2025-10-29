

const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');

/**
 * Initialize or get course progress
 * POST /api/progress/course/init
 */
const initializeCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, totalLessons } = req.body;

    if (!courseId || !totalLessons) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and total lessons are required'
      });
    }

    // Use findOneAndUpdate with upsert for atomic operation
    const progress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      {
        $setOnInsert: {
          userId,
          courseId,
          currentSectionId: '',
          currentLessonIndex: 0,
          totalLessons,
          completedLessons: 0,
          lastAccessedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Initialize progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize progress'
    });
  }
};

/**
 * Get course progress overview
 * GET /api/progress/course/:courseId
 */
const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this course'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
};

/**
 * Get all completed lessons in a course
 * GET /api/progress/course/:courseId/lessons
 */
const getCompletedLessons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const lessons = await LessonProgress
      .find({ userId, courseId, completed: true })
      .select('sectionId lessonIndex completedAt')
      .sort({ completedAt: 1 })
      .lean();

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('❌ Get completed lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed lessons'
    });
  }
};

/**
 * Mark lesson as complete and update course progress
 * POST /api/progress/lesson/complete
 */
const markLessonComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      courseId,
      sectionId,
      lessonIndex,
      nextSectionId,
      nextLessonIndex
    } = req.body;

    if (!courseId || !sectionId || lessonIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, section ID, and lesson index are required'
      });
    }

    // Mark lesson as complete (upsert to avoid duplicates)
    await LessonProgress.findOneAndUpdate(
      { userId, courseId, sectionId, lessonIndex },
      {
        userId,
        courseId,
        sectionId,
        lessonIndex,
        completed: true,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Count total completed lessons
    const completedCount = await LessonProgress.countDocuments({
      userId,
      courseId,
      completed: true
    });

    // Update course progress
    const courseProgress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      {
        completedLessons: completedCount,
        currentSectionId: nextSectionId || sectionId,
        currentLessonIndex: nextLessonIndex !== undefined ? nextLessonIndex : lessonIndex + 1,
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: {
        courseProgress,
        completedLessons: completedCount
      }
    });
  } catch (error) {
    console.error('❌ Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as complete'
    });
  }
};

/**
 * Update current position in course (for resume functionality)
 * PUT /api/progress/course/:courseId/position
 */
const updateCoursePosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { currentSectionId, currentLessonIndex } = req.body;

    const progress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      {
        currentSectionId,
        currentLessonIndex,
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Update position error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update position'
    });
  }
};

/**
 * Get all courses user has started
 * GET /api/progress/courses
 */
const getAllCoursesProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await CourseProgress
      .find({ userId })
      .sort({ lastAccessedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('❌ Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

module.exports = {
  initializeCourseProgress,
  getCourseProgress,
  getCompletedLessons,
  markLessonComplete,
  updateCoursePosition,
  getAllCoursesProgress
};
