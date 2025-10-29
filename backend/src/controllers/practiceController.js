

const PracticeCategory = require('../models/PracticeCategory');
const PracticeTopic = require('../models/PracticeTopic');
const PracticeQuestion = require('../models/PracticeQuestion');

/**
 * Get all practice categories
 * GET /api/practice/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await PracticeCategory
      .find({ isActive: true })
      .select('name description icon orderIndex topicCount')
      .sort({ orderIndex: 1 })
      .lean();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * Get topics by category
 * GET /api/practice/categories/:categoryId/topics
 */
const getTopicsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify category exists
    const category = await PracticeCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const topics = await PracticeTopic
      .find({ categoryId, isActive: true })
      .select('name slug description difficulty questionCount')
      .sort({ orderIndex: 1 })
      .lean();

    res.json({
      success: true,
      category: {
        id: category._id,
        name: category.name
      },
      count: topics.length,
      data: topics
    });
  } catch (error) {
    console.error('❌ Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics'
    });
  }
};

/**
 * Get single topic details
 * GET /api/practice/topics/:topicId
 */
const getTopicDetails = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await PracticeTopic
      .findById(topicId)
      .populate('categoryId', 'name icon')
      .lean();

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('❌ Get topic details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic details'
    });
  }
};

/**
 * Get questions by topic
 * GET /api/practice/topics/:topicId/questions
 * Query params: limit, shuffle
 */
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { limit, shuffle } = req.query;

    // Verify topic exists
    const topic = await PracticeTopic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    let query = PracticeQuestion.find({ topicId, isActive: true })
      .select('questionNumber questionText optionA optionB optionC optionD difficulty')
      .lean();

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    // Fetch questions
    let questions = await query;

    // Shuffle if requested (Fisher-Yates algorithm)
    if (shuffle === 'true') {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    } else {
      // Default sort by question number
      questions.sort((a, b) => a.questionNumber - b.questionNumber);
    }

    res.json({
      success: true,
      topic: {
        id: topic._id,
        name: topic.name,
        difficulty: topic.difficulty
      },
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('❌ Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

/**
 * Get single question (admin only - includes answer)
 * GET /api/practice/questions/:questionId
 */
const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await PracticeQuestion
      .findById(questionId)
      .populate('topicId', 'name difficulty')
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('❌ Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
};

/**
 * Submit quiz answers and get results
 * POST /api/practice/topics/:topicId/submit
 * Body: { answers: [{ questionId, selectedOption }] }
 */
const submitQuizAnswers = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Extract question IDs
    const questionIds = answers.map(a => a.questionId);

    // Fetch correct answers
    const questions = await PracticeQuestion
      .find({ _id: { $in: questionIds }, topicId })
      .select('_id correctAnswer explanation')
      .lean();

    // Create lookup map
    const questionMap = new Map(
      questions.map(q => [q._id.toString(), q])
    );

    // Evaluate answers
    const results = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      
      if (!question) {
        return {
          questionId: answer.questionId,
          error: 'Question not found'
        };
      }

      const isCorrect = answer.selectedOption === question.correctAnswer;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    // Calculate score
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    res.json({
      success: true,
      score: {
        correct: correctCount,
        total: totalQuestions,
        percentage: parseFloat(percentage)
      },
      results
    });
  } catch (error) {
    console.error('❌ Submit answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answers'
    });
  }
};

/**
 * Search questions across all topics
 * GET /api/practice/search
 * Query params: q, categoryId, difficulty, limit
 */
const searchQuestions = async (req, res) => {
  try {
    const { q, categoryId, difficulty, limit = 20 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters'
      });
    }

    // Build filter
    const filter = {
      isActive: true,
      $text: { $search: q }
    };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // If category provided, get topics first
    if (categoryId) {
      const topics = await PracticeTopic
        .find({ categoryId })
        .select('_id')
        .lean();
      
      filter.topicId = { $in: topics.map(t => t._id) };
    }

    const questions = await PracticeQuestion
      .find(filter, { score: { $meta: 'textScore' } })
      .select('questionNumber questionText topicId difficulty')
      .populate('topicId', 'name categoryId')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('❌ Search questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search questions'
    });
  }
};

module.exports = {
  getCategories,
  getTopicsByCategory,
  getTopicDetails,
  getQuestionsByTopic,
  getQuestionById,
  submitQuizAnswers,
  searchQuestions
};
