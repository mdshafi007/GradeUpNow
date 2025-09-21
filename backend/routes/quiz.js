import express from 'express';
import { Question, Quiz, QuizResult } from '../models/Quiz.js';
import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

/**
 * GET /api/quiz/:category
 * Get quiz by category (e.g., "data-structures")
 */
router.get('/:category', verifyFirebaseToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.uid;

    // Find quiz for this category
    let quiz = await Quiz.findOne({ 
      category: category.replace('-', ' '),
      isActive: true 
    }).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `Quiz for category "${category}" not found`
      });
    }

    // Check if user has attempted this quiz before
    const userAttempts = await QuizResult.find({ 
      userId, 
      quizId: quiz._id 
    }).sort({ attemptNumber: -1 });

    const attemptNumber = userAttempts.length + 1;

    // Check if user has exceeded max attempts
    if (quiz.maxAttempts && userAttempts.length >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
      });
    }

    // Simple shuffle for now (we'll improve this later)
    const shuffledQuestions = quiz.questions.sort(() => Math.random() - 0.5);

    // Remove correct answers from response for security
    const questionsForUser = shuffledQuestions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        attemptNumber,
        startTime: Date.now()
      },
      questions: questionsForUser,
      userStats: {
        previousAttempts: userAttempts.length,
        bestScore: userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0,
        lastAttempt: userAttempts.length > 0 ? userAttempts[0].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/quiz/submit
 * Submit quiz answers and calculate results
 */
router.post('/submit', verifyFirebaseToken, async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const userName = req.user.name || req.user.email?.split('@')[0];

    // Validate input
    if (!quizId || !answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers are required'
      });
    }

    // Get quiz with questions
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user has exceeded max attempts
    const userAttempts = await QuizResult.find({ userId, quizId });
    if (quiz.maxAttempts && userAttempts.length >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      });
    }

    const attemptNumber = userAttempts.length + 1;
    const startedAt = new Date(Date.now() - (timeTaken || 0));

    // Calculate results
    const results = [];
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    quiz.questions.forEach(question => {
      const questionId = question._id.toString();
      const userAnswer = answers[questionId];

      if (userAnswer === undefined || userAnswer === null) {
        unanswered++;
        return;
      }

      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }

      results.push({
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect,
        timeTaken: Math.floor((timeTaken || 0) / quiz.questions.length) // Distribute time evenly
      });
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Save result to database
    const quizResult = new QuizResult({
      userId,
      userName,
      userEmail,
      quizId,
      answers: results,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      timeTaken: timeTaken || 0,
      passed,
      attemptNumber,
      startedAt,
      completedAt: new Date()
    });

    const savedResult = await quizResult.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      resultId: savedResult._id,
      result: {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        passed,
        grade: savedResult.getGrade(),
        attemptNumber,
        timeTaken
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/quiz/result/:resultId
 * Get detailed quiz result
 */
router.get('/result/:resultId', verifyFirebaseToken, async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user.uid;

    const result = await QuizResult.findOne({
      _id: resultId,
      userId
    }).populate({
      path: 'quizId',
      select: 'title description category difficulty passingScore'
    }).populate({
      path: 'answers.questionId',
      select: 'questionText options correctAnswer explanation'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found'
      });
    }

    res.status(200).json({
      success: true,
      result: {
        ...result.toObject(),
        grade: result.getGrade(),
        percentage: result.percentage
      }
    });

  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/quiz/history/:userId
 * Get user's quiz history
 */
router.get('/history/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own history
    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const results = await QuizResult.find({ userId })
      .populate({
        path: 'quizId',
        select: 'title category difficulty'
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      results: results.map(result => ({
        _id: result._id,
        quiz: result.quizId,
        score: result.score,
        passed: result.passed,
        grade: result.getGrade(),
        attemptNumber: result.attemptNumber,
        completedAt: result.completedAt,
        timeTaken: result.timeTaken
      }))
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/quiz/result/:resultId
 * Get quiz result by ID
 */
router.get('/result/:resultId', verifyFirebaseToken, async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user.uid;

    // Find the quiz result
    const result = await QuizResult.findOne({
      _id: resultId,
      userId: userId
    }).populate({
      path: 'quizId',
      select: 'title category difficulty'
    }).populate({
      path: 'answers.questionId',
      select: 'questionText options correctAnswer explanation difficulty'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found'
      });
    }

    res.status(200).json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Get quiz result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/quiz/categories
 * Get all available quiz categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Quiz.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          difficulties: { $addToSet: '$difficulty' },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        slug: cat._id.toLowerCase().replace(/\s+/g, '-'),
        count: cat.count,
        difficulties: cat.difficulties.filter(Boolean),
        subcategories: cat.subcategories.filter(Boolean)
      }))
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/quiz/meta/counts
 * Get question counts for all quiz categories
 */
router.get('/meta/counts', async (req, res) => {
  try {
    // Get counts for each category
    const categories = [
      'data structures',
      'operating systems', 
      'computer networks',
      'oops',
      'dbms'
    ];

    const counts = {};
    
    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      // Convert database category names to frontend-friendly format
      const displayCategory = category === 'data structures' ? 'data-structures' :
                            category === 'operating systems' ? 'operating-systems' :
                            category === 'computer networks' ? 'computer-networks' :
                            category;
      counts[displayCategory] = count;
    }

    res.json({
      success: true,
      data: counts
    });

  } catch (error) {
    console.error('Error fetching question counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question counts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;