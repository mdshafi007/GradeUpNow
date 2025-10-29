const { Assessment, QuizQuestion, CodingProblem, StudentAttempt } = require('../models');

/**
 * @desc    Get all assessments (with filters)
 * @route   GET /api/lms/admin/assessments
 * @access  Private (Admin only)
 */
const getAllAssessments = async (req, res) => {
  try {
    const { college, branch, type, isActive } = req.query;

    // Build filter
    const filter = {};
    if (college) filter.college = college;
    if (branch) filter.branch = branch;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const assessments = await Assessment.find(filter)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    console.error('Get all assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
};

/**
 * @desc    Get single assessment by ID
 * @route   GET /api/lms/admin/assessments/:id
 * @access  Private (Admin only)
 */
const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('adminId', 'name email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get questions based on assessment type
    let questions = [];
    if (assessment.type === 'Quiz') {
      questions = await QuizQuestion.find({ assessmentId: assessment._id })
        .sort({ questionNumber: 1 });
    } else if (assessment.type === 'Coding') {
      questions = await CodingProblem.find({ assessmentId: assessment._id })
        .sort({ problemNumber: 1 });
    }

    res.status(200).json({
      success: true,
      assessment,
      questions
    });
  } catch (error) {
    console.error('Get assessment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment',
      error: error.message
    });
  }
};

/**
 * @desc    Create new assessment
 * @route   POST /api/lms/admin/assessments
 * @access  Private (Admin only)
 */
const createAssessment = async (req, res) => {
  try {
    const {
      college,
      branch,
      name,
      type,
      description,
      startDate,
      endDate,
      duration,
      isActive,
      settings
    } = req.body;

    // Validate required fields
    if (!college || !branch || !name || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: college, branch, name, type, startDate, endDate'
      });
    }

    // Validate type
    if (!['Quiz', 'Coding'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "Quiz" or "Coding"'
      });
    }

    // Create assessment
    const assessment = new Assessment({
      adminId: req.userId,
      college,
      branch,
      name,
      type,
      description,
      startDate,
      endDate,
      duration,
      isActive: isActive !== undefined ? isActive : true,
      settings: settings || {}
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: error.message
    });
  }
};

/**
 * @desc    Update assessment
 * @route   PUT /api/lms/admin/assessments/:id
 * @access  Private (Admin only)
 */
const updateAssessment = async (req, res) => {
  try {
    const updates = req.body;

    // Don't allow updating adminId
    delete updates.adminId;

    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      assessment
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment',
      error: error.message
    });
  }
};

/**
 * @desc    Delete assessment
 * @route   DELETE /api/lms/admin/assessments/:id
 * @access  Private (Admin only)
 */
const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Delete all related questions
    if (assessment.type === 'Quiz') {
      await QuizQuestion.deleteMany({ assessmentId: assessment._id });
    } else if (assessment.type === 'Coding') {
      await CodingProblem.deleteMany({ assessmentId: assessment._id });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assessment',
      error: error.message
    });
  }
};

/**
 * @desc    Add quiz questions to assessment
 * @route   POST /api/lms/admin/assessments/:id/quiz-questions
 * @access  Private (Admin only)
 */
const addQuizQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }

    // Verify assessment exists and is a Quiz
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.type !== 'Quiz') {
      return res.status(400).json({
        success: false,
        message: 'This assessment is not a Quiz type'
      });
    }

    const createdQuestions = [];
    for (const q of questions) {
      const question = new QuizQuestion({
        assessmentId: req.params.id,
        ...q
      });
      await question.save();
      createdQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      message: `Added ${createdQuestions.length} questions`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Add quiz questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add questions',
      error: error.message
    });
  }
};

/**
 * @desc    Add coding problems to assessment
 * @route   POST /api/lms/admin/assessments/:id/coding-problems
 * @access  Private (Admin only)
 */
/**
 * @desc    Add coding problems to assessment
 * @route   POST /api/lms/admin/assessments/:id/coding-problems
 * @access  Private (Admin only)
 */
const addCodingProblems = async (req, res) => {
  try {
    const { problems } = req.body;

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of problems'
      });
    }

    // Verify assessment exists and is a Coding type
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.type !== 'Coding') {
      return res.status(400).json({
        success: false,
        message: 'This assessment is not a Coding type'
      });
    }

    // Delete all existing problems for this assessment (replace approach)
    await CodingProblem.deleteMany({ assessmentId: req.params.id });

    // Create new problems
    const createdProblems = [];
    for (const p of problems) {
      const problem = new CodingProblem({
        assessmentId: req.params.id,
        ...p
      });
      await problem.save();
      createdProblems.push(problem);
    }

    res.status(201).json({
      success: true,
      message: `Added ${createdProblems.length} problems`,
      problems: createdProblems
    });
  } catch (error) {
    console.error('Add coding problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add problems',
      error: error.message
    });
  }
};

/**
 * @desc    Get coding problems for assessment (Admin view)
 * @route   GET /api/lms/admin/assessments/:id/coding-problems-list
 * @access  Private (Admin only)
 */
const getCodingProblemsList = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.type !== 'Coding') {
      return res.status(400).json({
        success: false,
        message: 'This assessment is not a Coding type'
      });
    }

    const problems = await CodingProblem.find({ assessmentId: req.params.id })
      .sort({ problemNumber: 1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (error) {
    console.error('Get coding problems list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems',
      error: error.message
    });
  }
};

/**
 * @desc    Get assessment analytics
 * @route   GET /api/lms/admin/assessments/:id/analytics
 * @access  Private (Admin only)
 */
const getAssessmentAnalytics = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get all attempts for this assessment
    const attempts = await StudentAttempt.find({ assessmentId: req.params.id })
      .populate('studentId', 'name email registrationNumber');

    // Calculate statistics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.isCompleted).length;
    const inProgressAttempts = attempts.filter(a => a.isActive).length;

    const scores = attempts
      .filter(a => a.isCompleted)
      .map(a => a.score);

    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        assessment: {
          name: assessment.name,
          type: assessment.type,
          status: assessment.getStatus()
        },
        attempts: {
          total: totalAttempts,
          completed: completedAttempts,
          inProgress: inProgressAttempts
        },
        scores: {
          average: Math.round(avgScore * 100) / 100,
          maximum: maxScore,
          minimum: minScore
        },
        attempts: attempts
      }
    });
  } catch (error) {
    console.error('Get assessment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get all attempts for an assessment with student details
 * @route   GET /api/lms/admin/assessments/:id/attempts
 * @access  Private (Admin only)
 */
const getAssessmentAttempts = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get all submitted attempts for this assessment with student details
    const attempts = await StudentAttempt.find({ 
      assessmentId: req.params.id,
      status: 'submitted'
    })
    .populate('studentId', 'name email registrationNumber year semester section')
    .sort({ submitTime: -1 });

    // Format attempts for report display
    const formattedAttempts = attempts.map(attempt => {
      // Calculate time spent in seconds
      let timeSpent = 0;
      if (attempt.startTime && attempt.endTime) {
        timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000);
      }
      
      return {
        _id: attempt._id,
        studentId: {
          _id: attempt.studentId._id,
          name: attempt.studentId.name,
          email: attempt.studentId.email,
          registrationNumber: attempt.studentId.registrationNumber,
          year: attempt.studentId.year,
          semester: attempt.studentId.semester,
          section: attempt.studentId.section
        },
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        timeSpent: timeSpent,
        tabSwitches: attempt.tabSwitches || 0,
        fullscreenExits: attempt.fullscreenExits || 0,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        submitTime: attempt.submitTime
      };
    });

    res.status(200).json({
      success: true,
      attempts: formattedAttempts
    });
  } catch (error) {
    console.error('Get assessment attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

module.exports = {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  addQuizQuestions,
  addCodingProblems,
  getCodingProblemsList,
  getAssessmentAnalytics,
  getAssessmentAttempts
};
