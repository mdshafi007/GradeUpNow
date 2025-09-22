import express from 'express';
import { QuizResult } from '../models/QuizResult.js';
import { verifyFirebaseToken } from '../config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Load quiz data from JSON files
const loadQuizData = (category) => {
  try {
    const quizFileName = `${category}-quiz.json`;
    const quizPath = path.join(__dirname, '../../src/data', quizFileName);
    const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
    return quizData;
  } catch (error) {
    console.error(`Error loading quiz data for ${category}:`, error);
    return null;
  }
};

// Get available quiz categories from JSON files
const getAvailableCategories = () => {
  const dataDir = path.join(__dirname, '../../src/data');
  const files = fs.readdirSync(dataDir);
  const quizFiles = files.filter(file => file.endsWith('-quiz.json'));
  
  return quizFiles.map(file => {
    const category = file.replace('-quiz.json', '');
    const quizData = loadQuizData(category);
    return {
      name: quizData?.category || category,
      slug: category,
      count: quizData?.questions?.length || 0,
      difficulty: quizData?.difficulty || 'medium',
      title: quizData?.title || category
    };
  });
};

/**
 * GET /api/quiz/meta/counts
 * Get question counts for all quiz categories
 */
router.get('/meta/counts', async (req, res) => {
  try {
    const categories = getAvailableCategories();
    const counts = {};
    
    categories.forEach(category => {
      counts[category.slug] = category.count;
    });

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

/**
 * GET /api/quiz/categories
 * Get all available quiz categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = getAvailableCategories();

    res.status(200).json({
      success: true,
      categories: categories
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
 * GET /api/quiz/:category
 * Get quiz by category (e.g., "data-structures")
 */
router.get('/:category', verifyFirebaseToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.uid;

    // Load quiz data from JSON file
    const quizData = loadQuizData(category);

    if (!quizData) {
      return res.status(404).json({
        success: false,
        message: `Quiz for category "${category}" not found`
      });
    }

    // Check if user has attempted this quiz before (using category as quiz identifier)
    const userAttempts = await QuizResult.find({ 
      userId, 
      quizId: category // Use category as quiz identifier since we don't have MongoDB quiz _id
    }).sort({ attemptNumber: -1 });

    const attemptNumber = userAttempts.length + 1;

    // Check if user has exceeded max attempts (default to no limit for JSON-based quizzes)
    const maxAttempts = quizData.maxAttempts || null;
    if (maxAttempts && userAttempts.length >= maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempts (${maxAttempts}) reached for this quiz`
      });
    }

    // Shuffle questions
    const shuffledQuestions = [...quizData.questions].sort(() => Math.random() - 0.5);

    // Remove correct answers from response for security and add unique IDs
    const questionsForUser = shuffledQuestions.map((q, index) => ({
      _id: `${category}_q${index}`, // Generate unique ID for frontend
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id: category, // Use category as quiz ID
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        difficulty: quizData.difficulty,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
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
    console.log('=== QUIZ SUBMISSION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User object:', req.user);
    
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user?.uid;
    const userEmail = req.user?.email;
    const userName = req.user?.name || req.user?.email?.split('@')[0];

    console.log('Extracted data:', { quizId, userId, userEmail, userName, answersCount: Object.keys(answers || {}).length });

    // Validate input
    if (!quizId || !answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers are required'
      });
    }

    // Load quiz data from JSON file (quizId is the category name)
    const quizData = loadQuizData(quizId);
    if (!quizData) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user has exceeded max attempts
    const userAttempts = await QuizResult.find({ userId, quizId });
    const maxAttempts = quizData.maxAttempts || null;
    if (maxAttempts && userAttempts.length >= maxAttempts) {
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

    console.log('Processing answers:', answers);
    console.log('Quiz questions count:', quizData.questions.length);

    quizData.questions.forEach((question, index) => {
      const questionId = `${quizId}_q${index}`; // Match the ID format used when serving questions
      const userAnswer = answers[questionId];

      console.log(`Question ${index}: questionId=${questionId}, userAnswer=${userAnswer}, correctAnswer=${question.correctAnswer}`);

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
        questionId: questionId,
        selectedOption: userAnswer,
        isCorrect,
        timeTaken: Math.floor((timeTaken || 0) / quizData.questions.length) // Distribute time evenly
      });
    });

    console.log('Results calculated:', { correctAnswers, wrongAnswers, unanswered, totalAnswers: results.length });

    const totalQuestions = quizData.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quizData.passingScore;

    // Validate required data before creating QuizResult
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }

    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must have questions'
      });
    }

    // Save result to database - Simplified version
    console.log('Creating QuizResult with data:', {
      userId,
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      quizId,
      answers: results,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      timeTaken: timeTaken || 0,
      passed,
      attemptNumber
    });

    const quizResult = new QuizResult({
      userId,
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      quizId,
      answers: results,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      timeTaken: timeTaken || 0,
      passed,
      attemptNumber
    });

    console.log('QuizResult created, attempting to save...');
    
    try {
      const savedResult = await quizResult.save();
      console.log('QuizResult saved successfully:', savedResult._id);

      // Get grade safely
      let grade = 'F';
      try {
        grade = savedResult.getGrade();
      } catch (gradeError) {
        console.error('Error getting grade:', gradeError);
      }

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
          grade,
          attemptNumber,
          timeTaken: timeTaken || 0
        }
      });
    } catch (saveError) {
      console.error('Error saving QuizResult:', saveError);
      console.error('Validation errors:', saveError.errors);
      console.error('Error stack:', saveError.stack);
      
      // Handle specific validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.keys(saveError.errors).map(key => ({
          field: key,
          message: saveError.errors[key].message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }
      
      // Handle other save errors
      return res.status(500).json({
        success: false,
        message: 'Failed to save quiz result',
        error: process.env.NODE_ENV === 'development' ? saveError.message : 'Internal server error'
      });
    }

  } catch (error) {
    console.error('Submit quiz error:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/quiz/result/:resultId
 * Get detailed quiz result
 */
router.get('/result/:resultId', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('=== FETCHING QUIZ RESULT ===');
    const { resultId } = req.params;
    const userId = req.user?.uid;
    
    console.log('Request params:', { resultId, userId });

    if (!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    console.log('Searching for result with ID:', resultId);
    const result = await QuizResult.findOne({
      _id: resultId,
      userId
    });

    console.log('Found result:', result ? 'YES' : 'NO');

    if (!result) {
      console.log('Result not found for:', { resultId, userId });
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found'
      });
    }

    console.log('Loading quiz data for category:', result.quizId);
    // Load quiz data to get question details
    const quizData = loadQuizData(result.quizId);
    console.log('Quiz data loaded:', quizData ? 'YES' : 'NO');
    
    // Enhance result with quiz and question data
    const enhancedResult = {
      ...result.toObject(),
      grade: result.getGrade(),
      percentage: result.percentage,
      quiz: {
        title: quizData?.title || result.quizId,
        category: quizData?.category || result.quizId,
        difficulty: quizData?.difficulty || 'medium'
      }
    };

    // If quiz data is available, enhance answers with question details
    if (quizData) {
      enhancedResult.answers = result.answers.map(answer => {
        const questionIndex = parseInt(answer.questionId.split('_q')[1]);
        const question = quizData.questions[questionIndex];
        
        return {
          ...answer.toObject(),
          question: question ? {
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty
          } : null
        };
      });
    }

    res.status(200).json({
      success: true,
      result: enhancedResult
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
      .sort({ createdAt: -1 })
      .limit(50);

    // Enhance results with quiz data from JSON files
    const enhancedResults = results.map(result => {
      const quizData = loadQuizData(result.quizId);
      return {
        _id: result._id,
        quiz: {
          title: quizData?.title || result.quizId,
          category: quizData?.category || result.quizId,
          difficulty: quizData?.difficulty || 'medium'
        },
        score: result.score,
        passed: result.passed,
        grade: result.getGrade(),
        attemptNumber: result.attemptNumber,
        completedAt: result.completedAt,
        timeTaken: result.timeTaken
      };
    });

    res.status(200).json({
      success: true,
      results: enhancedResults
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

// Test endpoint to verify everything is working
router.post('/test-submit', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('=== TEST SUBMIT ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: {
        body: req.body,
        user: req.user
      }
    });
  } catch (error) {
    console.error('Test submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Debug endpoint to list recent quiz results
router.get('/debug/results', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const results = await QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    res.json({
      success: true,
      count: results.length,
      results: results.map(r => ({
        _id: r._id,
        quizId: r.quizId,
        score: r.score,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;