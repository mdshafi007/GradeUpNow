const { Assessment, QuizQuestion, StudentAttempt, StudentAnswer } = require('../models');

/**
 * @desc    Get all available assessments for student
 * @route   GET /api/lms/student/assessments
 * @access  Private (Student only)
 */
const getAvailableAssessments = async (req, res) => {
  try {
    const student = req.user;

    // Get assessments for student's college and branch
    const assessments = await Assessment.find({
      college: student.college,
      branch: student.branch,
      isActive: true
    }).sort({ startDate: -1 });

    // Check if student has attempted each assessment
    const assessmentsWithStatus = await Promise.all(
      assessments.map(async (assessment) => {
        const attempt = await StudentAttempt.findOne({
          studentId: student._id,
          assessmentId: assessment._id
        }).sort({ createdAt: -1 });

        return {
          ...assessment.toObject(),
          hasAttempted: !!attempt,
          attemptStatus: attempt?.status,
          attemptScore: attempt?.score,
          attemptPercentage: attempt?.percentage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: assessmentsWithStatus.length,
      assessments: assessmentsWithStatus
    });
  } catch (error) {
    console.error('Get available assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
};

/**
 * @desc    Get assessment details
 * @route   GET /api/lms/student/assessments/:id
 * @access  Private (Student only)
 */
const getAssessmentDetails = async (req, res) => {
  try {
    const student = req.user;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if assessment belongs to student's college and branch
    if (assessment.college !== student.college || assessment.branch !== student.branch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this assessment'
      });
    }

    // Check if student has an existing attempt
    const existingAttempt = await StudentAttempt.findOne({
      studentId: student._id,
      assessmentId: assessment._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assessment,
      hasAttempted: !!existingAttempt,
      attempt: existingAttempt
    });
  } catch (error) {
    console.error('Get assessment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment details',
      error: error.message
    });
  }
};

/**
 * @desc    Start quiz attempt
 * @route   POST /api/lms/student/assessments/:id/start-quiz
 * @access  Private (Student only)
 */
const startQuizAttempt = async (req, res) => {
  try {
    const student = req.user;
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
        message: 'This is not a quiz assessment'
      });
    }

    // Check if assessment is active
    if (assessment.getStatus() !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Assessment is not currently active'
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await StudentAttempt.findOne({
      studentId: student._id,
      assessmentId: assessment._id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      // Return existing attempt
      const questions = await QuizQuestion.find({ assessmentId: assessment._id })
        .select('-correctAnswer') // Don't send correct answers
        .sort({ questionNumber: 1 });

      return res.status(200).json({
        success: true,
        message: 'Continuing existing attempt',
        attempt: existingAttempt,
        questions
      });
    }

    // Get all questions
    const questions = await QuizQuestion.find({ assessmentId: assessment._id })
      .sort({ questionNumber: 1 });

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Create new attempt
    const attempt = new StudentAttempt({
      studentId: student._id,
      assessmentId: assessment._id,
      startTime: new Date(),
      totalMarks,
      status: 'in_progress'
    });

    await attempt.save();

    // Send questions without correct answers
    const questionsForStudent = questions.map(q => ({
      _id: q._id,
      questionNumber: q.questionNumber,
      question: q.question,
      options: q.options,
      marks: q.marks
    }));

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      attempt,
      questions: questionsForStudent
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: error.message
    });
  }
};

/**
 * @desc    Submit quiz answer
 * @route   POST /api/lms/student/attempts/:attemptId/answer
 * @access  Private (Student only)
 */
const submitQuizAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const student = req.user;

    if (!questionId || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and selected answer are required'
      });
    }

    // Verify attempt belongs to student
    const attempt = await StudentAttempt.findById(req.params.attemptId);
    if (!attempt || attempt.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'This attempt is no longer active'
      });
    }

    // Get question to check correct answer
    const question = await QuizQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer already exists
    let answer = await StudentAnswer.findOne({
      attemptId: req.params.attemptId,
      questionId
    });

    if (answer) {
      // Update existing answer
      answer.selectedAnswer = selectedAnswer;
      answer.isCorrect = selectedAnswer === question.correctAnswer;
      answer.marksAwarded = answer.isCorrect ? question.marks : 0;
      answer.answeredAt = new Date();
    } else {
      // Create new answer
      answer = new StudentAnswer({
        attemptId: req.params.attemptId,
        questionId,
        selectedAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        marksAwarded: selectedAnswer === question.correctAnswer ? question.marks : 0
      });
    }

    await answer.save();

    // Add answer to attempt if not already there
    if (!attempt.answers.includes(answer._id)) {
      attempt.answers.push(answer._id);
      await attempt.save();
    }

    res.status(200).json({
      success: true,
      message: 'Answer saved',
      answer: {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer
      }
    });
  } catch (error) {
    console.error('Submit quiz answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

/**
 * @desc    Submit complete quiz
 * @route   POST /api/lms/student/attempts/:attemptId/submit
 * @access  Private (Student only)
 */
const submitQuiz = async (req, res) => {
  try {
    const student = req.user;

    // Verify attempt belongs to student
    const attempt = await StudentAttempt.findById(req.params.attemptId)
      .populate('assessmentId');

    if (!attempt || attempt.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'This attempt is already submitted'
      });
    }

    // Calculate score
    const scoreData = await StudentAnswer.calculateScore(attempt._id);

    // Update attempt with tracking data from request body
    const { tabSwitches, fullscreenExits } = req.body;
    
    attempt.endTime = new Date();
    attempt.submitTime = new Date();
    attempt.status = 'submitted';
    attempt.score = scoreData.score;
    
    // Update tracking data if provided
    if (tabSwitches !== undefined) {
      attempt.tabSwitches = tabSwitches;
    }
    if (fullscreenExits !== undefined) {
      attempt.fullscreenExits = fullscreenExits;
    }
    
    await attempt.save();

    // Get all answers with questions for results
    const answers = await StudentAnswer.find({ attemptId: attempt._id })
      .populate('questionId');

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      results: {
        attempt,
        score: scoreData.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        correctAnswers: scoreData.correctAnswers,
        totalQuestions: scoreData.totalQuestions,
        answers: answers.map(a => ({
          questionNumber: a.questionId.questionNumber,
          question: a.questionId.question,
          options: a.questionId.options,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: a.questionId.correctAnswer,
          isCorrect: a.isCorrect,
          marksAwarded: a.marksAwarded
        }))
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

/**
 * @desc    Track tab switch
 * @route   POST /api/lms/student/attempts/:attemptId/tab-switch
 * @access  Private (Student only)
 */
const trackTabSwitch = async (req, res) => {
  try {
    const student = req.user;

    const attempt = await StudentAttempt.findById(req.params.attemptId)
      .populate('assessmentId');

    if (!attempt || attempt.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Attempt is not active'
      });
    }

    // Increment tab switches
    attempt.tabSwitches += 1;
    attempt.tabSwitchTimestamps.push(new Date());

    // Check if max tab switches exceeded
    const assessment = attempt.assessmentId;
    if (
      !assessment.settings.allowTabSwitch ||
      (assessment.settings.maxTabSwitches && 
       attempt.tabSwitches > assessment.settings.maxTabSwitches)
    ) {
      // Auto-submit the attempt
      attempt.status = 'auto_submitted';
      attempt.endTime = new Date();
      
      // Calculate score
      const scoreData = await StudentAnswer.calculateScore(attempt._id);
      attempt.score = scoreData.score;
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      tabSwitches: attempt.tabSwitches,
      maxAllowed: assessment.settings.maxTabSwitches,
      autoSubmitted: attempt.status === 'auto_submitted'
    });
  } catch (error) {
    console.error('Track tab switch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track tab switch',
      error: error.message
    });
  }
};

/**
 * @desc    Get student's attempt history
 * @route   GET /api/lms/student/attempts
 * @access  Private (Student only)
 */
const getAttemptHistory = async (req, res) => {
  try {
    const student = req.user;

    const attempts = await StudentAttempt.find({
      studentId: student._id
    })
      .populate('assessmentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error('Get attempt history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt history',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableAssessments,
  getAssessmentDetails,
  startQuizAttempt,
  submitQuizAnswer,
  submitQuiz,
  trackTabSwitch,
  getAttemptHistory
};
