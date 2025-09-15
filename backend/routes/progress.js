import express from 'express';
import { body, validationResult } from 'express-validator';
import UserProgress from '../models/UserProgress.js';
import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

// Get user progress
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      // Create initial progress record
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
        overallStats: {
          totalCoursesEnrolled: 0,
          totalCoursesCompleted: 0,
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          totalNotesCreated: 0,
          totalQuizzesTaken: 0,
          averageQuizScore: 0,
          currentStreak: 0,
          longestStreak: 0,
        }
      });
      userProgress = await userProgress.save();
    }

    res.json({
      success: true,
      data: userProgress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update course progress
router.post('/course/:courseId', verifyFirebaseToken, [
  body('courseName').trim().isLength({ min: 1 }).withMessage('Course name is required'),
  body('overallProgress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0-100'),
  body('status').optional().isIn(['not-started', 'in-progress', 'completed', 'paused']),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.params;
    const progressData = {
      courseId,
      lastAccessedAt: new Date(),
      ...req.body
    };

    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
      });
    }

    await userProgress.updateCourseProgress(courseId, progressData);

    // Update overall stats
    const courseProgress = userProgress.courseProgress.find(cp => cp.courseId === courseId);
    if (courseProgress) {
      userProgress.overallStats.totalCoursesEnrolled = userProgress.courseProgress.length;
      userProgress.overallStats.totalCoursesCompleted = userProgress.courseProgress.filter(
        cp => cp.status === 'completed'
      ).length;
      
      // Update total time spent
      userProgress.overallStats.totalTimeSpent = userProgress.courseProgress.reduce(
        (total, cp) => total + (cp.totalTimeSpent || 0), 0
      );
    }

    await userProgress.save();

    res.json({
      success: true,
      message: 'Course progress updated successfully',
      data: userProgress
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add completed chapter
router.post('/course/:courseId/chapter', verifyFirebaseToken, [
  body('chapterId').trim().isLength({ min: 1 }).withMessage('Chapter ID is required'),
  body('chapterName').trim().isLength({ min: 1 }).withMessage('Chapter name is required'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0-100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.params;
    const chapterData = {
      ...req.body,
      completedAt: new Date()
    };

    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
      });
    }

    // Find or create course progress
    let courseProgress = userProgress.courseProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) {
      userProgress.courseProgress.push({
        courseId,
        courseName: req.body.courseName || courseId,
        chaptersCompleted: [],
        totalTimeSpent: 0,
        status: 'in-progress',
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
      courseProgress = userProgress.courseProgress[userProgress.courseProgress.length - 1];
    }

    // Add chapter if not already completed
    const existingChapter = courseProgress.chaptersCompleted.find(
      ch => ch.chapterId === chapterData.chapterId
    );

    if (!existingChapter) {
      courseProgress.chaptersCompleted.push(chapterData);
      courseProgress.totalTimeSpent += chapterData.timeSpent || 0;
      courseProgress.lastAccessedAt = new Date();

      // Update overall stats
      userProgress.overallStats.totalLessonsCompleted += 1;
      userProgress.overallStats.totalTimeSpent += chapterData.timeSpent || 0;
    }

    await userProgress.save();

    res.json({
      success: true,
      message: 'Chapter progress updated successfully',
      data: userProgress
    });
  } catch (error) {
    console.error('Error updating chapter progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add quiz score
router.post('/course/:courseId/quiz', verifyFirebaseToken, [
  body('quizId').trim().isLength({ min: 1 }).withMessage('Quiz ID is required'),
  body('quizName').trim().isLength({ min: 1 }).withMessage('Quiz name is required'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0-100'),
  body('totalQuestions').isInt({ min: 1 }).withMessage('Total questions must be positive'),
  body('correctAnswers').isInt({ min: 0 }).withMessage('Correct answers must be non-negative'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.params;
    const quizData = {
      ...req.body,
      attemptedAt: new Date()
    };

    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
      });
    }

    // Find or create course progress
    let courseProgress = userProgress.courseProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) {
      userProgress.courseProgress.push({
        courseId,
        courseName: req.body.courseName || courseId,
        quizScores: [],
        totalTimeSpent: 0,
        status: 'in-progress',
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
      courseProgress = userProgress.courseProgress[userProgress.courseProgress.length - 1];
    }

    // Add quiz score
    courseProgress.quizScores.push(quizData);
    courseProgress.totalTimeSpent += quizData.timeSpent || 0;
    courseProgress.lastAccessedAt = new Date();

    // Calculate average score for the course
    const totalScore = courseProgress.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
    courseProgress.averageScore = Math.round(totalScore / courseProgress.quizScores.length);

    // Update overall stats
    userProgress.overallStats.totalQuizzesTaken += 1;
    userProgress.overallStats.totalTimeSpent += quizData.timeSpent || 0;

    // Calculate overall average quiz score
    const allQuizzes = userProgress.courseProgress.flatMap(cp => cp.quizScores);
    if (allQuizzes.length > 0) {
      const overallTotalScore = allQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
      userProgress.overallStats.averageQuizScore = Math.round(overallTotalScore / allQuizzes.length);
    }

    await userProgress.save();

    res.json({
      success: true,
      message: 'Quiz score added successfully',
      data: userProgress
    });
  } catch (error) {
    console.error('Error adding quiz score:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update daily activity
router.post('/daily-activity', verifyFirebaseToken, [
  body('minutesStudied').optional().isInt({ min: 0 }).withMessage('Minutes studied must be non-negative'),
  body('lessonsCompleted').optional().isInt({ min: 0 }).withMessage('Lessons completed must be non-negative'),
  body('notesCreated').optional().isInt({ min: 0 }).withMessage('Notes created must be non-negative'),
  body('quizzesTaken').optional().isInt({ min: 0 }).withMessage('Quizzes taken must be non-negative'),
  body('averageScore').optional().isInt({ min: 0, max: 100 }).withMessage('Average score must be between 0-100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
      });
    }

    await userProgress.updateDailyActivity(req.body);
    await userProgress.updateStreak();

    res.json({
      success: true,
      message: 'Daily activity updated successfully',
      data: userProgress
    });
  } catch (error) {
    console.error('Error updating daily activity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add achievement
router.post('/achievements', verifyFirebaseToken, [
  body('achievementId').trim().isLength({ min: 1 }).withMessage('Achievement ID is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Achievement name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Achievement description is required'),
  body('category').isIn(['time', 'streak', 'completion', 'score', 'special']).withMessage('Invalid category'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user.uid,
        userEmail: req.user.email,
      });
    }

    await userProgress.addAchievement(req.body);

    res.json({
      success: true,
      message: 'Achievement added successfully',
      data: userProgress
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get progress analytics
router.get('/analytics', verifyFirebaseToken, async (req, res) => {
  try {
    const userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Calculate analytics
    const analytics = {
      overallStats: userProgress.overallStats,
      completionRate: userProgress.overallCompletionRate,
      coursesInProgress: userProgress.courseProgress.filter(cp => cp.status === 'in-progress').length,
      averageSessionTime: userProgress.overallStats.totalTimeSpent / Math.max(userProgress.dailyActivity.length, 1),
      strongestSubjects: userProgress.learningAnalytics.strongSubjects || [],
      improvementAreas: userProgress.learningAnalytics.improvementAreas || [],
      recentActivity: userProgress.dailyActivity.slice(-7), // Last 7 days
      achievements: userProgress.achievements.slice(-5), // Recent achievements
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching progress analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get course-specific progress
router.get('/course/:courseId', verifyFirebaseToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userProgress = await UserProgress.findByUserId(req.user.uid);
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    const courseProgress = userProgress.courseProgress.find(cp => cp.courseId === courseId);
    
    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: 'Course progress not found'
      });
    }

    res.json({
      success: true,
      data: courseProgress
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
