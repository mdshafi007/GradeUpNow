const axios = require('axios');
const { Assessment, CodingProblem, StudentAttempt, CodeSubmission } = require('../models');

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://31.97.203.93:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  'c': 50,
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63
};

/**
 * @desc    Get coding problems for assessment
 * @route   GET /api/lms/student/assessments/:id/coding-problems
 * @access  Private (Student only)
 */
const getCodingProblems = async (req, res) => {
  try {
    const student = req.user;
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
        message: 'This is not a coding assessment'
      });
    }

    // Check access
    if (assessment.college !== student.college || assessment.branch !== student.branch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get or create attempt
    let attempt = await StudentAttempt.findOne({
      studentId: student._id,
      assessmentId: assessment._id,
      status: 'in_progress'
    });

    if (!attempt) {
      // Get all problems to calculate total marks
      const problems = await CodingProblem.find({ assessmentId: assessment._id });
      const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);

      attempt = new StudentAttempt({
        studentId: student._id,
        assessmentId: assessment._id,
        startTime: new Date(),
        totalMarks,
        status: 'in_progress'
      });
      await attempt.save();
    }

    // Get problems with test cases (students need to see sample test cases)
    const problems = await CodingProblem.find({ assessmentId: assessment._id })
      .sort({ problemNumber: 1 });

    // Format problems for frontend
    const formattedProblems = problems.map(problem => ({
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      input_format: problem.inputFormat,
      output_format: problem.outputFormat,
      constraints: problem.constraints,
      difficulty: problem.difficulty,
      problemNumber: problem.problemNumber,
      marks: problem.marks,
      testCases: (problem.testCases || []).map(tc => ({
        id: tc._id,
        input: tc.input,
        expected_output: tc.expectedOutput,
        is_hidden: tc.isHidden
      }))
    }));

    res.status(200).json({
      success: true,
      assessment,
      attempt,
      problems: formattedProblems
    });
  } catch (error) {
    console.error('Get coding problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding problems',
      error: error.message
    });
  }
};

/**
 * @desc    Submit code for a problem
 * @route   POST /api/lms/student/coding/submit
 * @access  Private (Student only)
 */
const submitCode = async (req, res) => {
  try {
    const { attemptId, problemId, code, language } = req.body;
    const student = req.user;

    if (!attemptId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify attempt
    const attempt = await StudentAttempt.findById(attemptId);
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

    // Get problem with test cases
    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Get language ID
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Create submission record
    const submission = new CodeSubmission({
      studentId: student._id,
      assessmentId: attempt.assessmentId,
      attemptId: attempt._id,
      problemId: problem._id,
      code,
      language,
      languageId,
      status: 'pending',
      totalTestCases: problem.testCases.length,
      maxScore: problem.marks
    });

    await submission.save();

    // Add submission to attempt
    if (!attempt.codeSubmissions.includes(submission._id)) {
      attempt.codeSubmissions.push(submission._id);
      await attempt.save();
    }

    // Run test cases (async process)
    runTestCases(submission, problem).catch(err => {
      console.error('Error running test cases:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Code submitted successfully',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit code',
      error: error.message
    });
  }
};

/**
 * Run test cases using Judge0 API
 */
const runTestCases = async (submission, problem) => {
  try {
    console.log(`[JUDGE0] Starting test execution for submission ${submission._id}`);
    console.log(`[JUDGE0] Judge0 URL: ${JUDGE0_API_URL}`);
    console.log(`[JUDGE0] Language ID: ${submission.languageId}`);
    console.log(`[JUDGE0] Problem has ${problem.testCases.length} test cases`);
    
    submission.status = 'processing';
    await submission.save();

    const testResults = [];
    let passedCount = 0;

    // 🚀 PARALLEL EXECUTION: Run all test cases simultaneously
    console.log(`[JUDGE0] Starting PARALLEL execution of ${problem.testCases.length} test cases`);
    
    const testCasePromises = problem.testCases.map(async (testCase, i) => {
      console.log(`[JUDGE0] Launching test case ${i + 1}/${problem.testCases.length}`);

      try {
        // Submit to Judge0
        const response = await axios.post(
          `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
          {
            source_code: submission.code,
            language_id: submission.languageId,
            stdin: testCase.input,
            expected_output: testCase.expectedOutput,
            cpu_time_limit: 5,
            memory_limit: 512000
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000 // 15 second timeout
          }
        );

        console.log(`[JUDGE0] Test case ${i + 1} completed:`, response.data.status);
        
        const result = response.data;
        const passed = result.status.id === 3; // Status 3 = Accepted

        return {
          testCaseNumber: i + 1,
          status: result.status.description,
          passed,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout || result.stderr || result.compile_output || '',
          executionTime: result.time ? parseFloat(result.time) : 0,
          memory: result.memory ? parseInt(result.memory) : 0,
          // Store first test case details for submission
          isFirst: i === 0,
          stdout: result.stdout,
          stderr: result.stderr,
          compileOutput: result.compile_output,
          message: result.message
        };
      } catch (err) {
        console.error(`[JUDGE0] Test case ${i + 1} error:`, err.message);
        return {
          testCaseNumber: i + 1,
          status: 'Error',
          passed: false,
          expectedOutput: testCase.expectedOutput,
          actualOutput: err.message,
          executionTime: 0,
          memory: 0,
          isFirst: i === 0
        };
      }
    });

    // Wait for all test cases to complete in parallel
    const results = await Promise.all(testCasePromises);
    
    // Process results
    results.forEach(result => {
      if (result.passed) passedCount++;
      
      // Update submission with first test case details
      if (result.isFirst) {
        submission.stdout = result.stdout;
        submission.stderr = result.stderr;
        submission.compileOutput = result.compileOutput;
        submission.message = result.message;
        submission.executionTime = result.executionTime;
        submission.memoryUsed = result.memory;
      }
      
      // Add to test results (without extra metadata)
      testResults.push({
        testCaseNumber: result.testCaseNumber,
        status: result.status,
        passed: result.passed,
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        executionTime: result.executionTime,
        memory: result.memory
      });
    });

    // Update submission
    console.log(`[JUDGE0] Execution complete: ${passedCount}/${problem.testCases.length} passed`);
    submission.testResults = testResults;
    submission.passedTestCases = passedCount;
    submission.status = passedCount === problem.testCases.length ? 'accepted' : 'wrong_answer';
    await submission.save();
    console.log(`[JUDGE0] Submission ${submission._id} saved with score: ${submission.score}`);

    // Update attempt score
    await updateAttemptScore(submission.attemptId);
  } catch (error) {
    console.error('[JUDGE0] Run test cases error:', error);
    submission.status = 'runtime_error';
    submission.message = error.message;
    await submission.save();
  }
};

/**
 * Update attempt score based on best submissions
 */
const updateAttemptScore = async (attemptId) => {
  try {
    const attempt = await StudentAttempt.findById(attemptId);
    if (!attempt) return;

    // Get all problems for this assessment
    const problems = await CodingProblem.find({ assessmentId: attempt.assessmentId });

    let totalScore = 0;

    // For each problem, get the best submission
    for (const problem of problems) {
      const bestSubmission = await CodeSubmission.findOne({
        attemptId: attempt._id,
        problemId: problem._id
      }).sort({ passedTestCases: -1, executionTime: 1 });

      if (bestSubmission) {
        totalScore += bestSubmission.score;
      }
    }

    attempt.score = totalScore;
    await attempt.save();
  } catch (error) {
    console.error('Update attempt score error:', error);
  }
};

/**
 * @desc    Get submission status
 * @route   GET /api/lms/student/coding/submissions/:id
 * @access  Private (Student only)
 */
const getSubmissionStatus = async (req, res) => {
  try {
    const student = req.user;

    const submission = await CodeSubmission.findById(req.params.id)
      .populate('problemId', 'title marks testCases');

    if (!submission || submission.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Filter out hidden test case details
    const submissionData = submission.toObject();
    if (submissionData.testResults && submissionData.problemId && submissionData.problemId.testCases) {
      submissionData.testResults = submissionData.testResults.map((result, index) => {
        const testCase = submissionData.problemId.testCases[index];
        if (testCase && testCase.isHidden) {
          // Only show if test passed or failed, but hide input/output details
          return {
            testCaseNumber: result.testCaseNumber,
            status: result.status,
            passed: result.passed,
            isHidden: true,
            executionTime: result.executionTime,
            memory: result.memory
          };
        }
        return result;
      });
    }

    res.status(200).json({
      success: true,
      submission: submissionData
    });
  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission status',
      error: error.message
    });
  }
};

/**
 * @desc    Get all submissions for a problem
 * @route   GET /api/lms/student/coding/problems/:problemId/submissions
 * @access  Private (Student only)
 */
const getProblemSubmissions = async (req, res) => {
  try {
    const student = req.user;
    const { attemptId } = req.query;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required'
      });
    }

    const submissions = await CodeSubmission.find({
      studentId: student._id,
      attemptId,
      problemId: req.params.problemId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get problem submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

/**
 * @desc    Submit coding assessment
 * @route   POST /api/lms/student/coding/attempts/:attemptId/submit
 * @access  Private (Student only)
 */
const submitCodingAssessment = async (req, res) => {
  try {
    const student = req.user;
    const { tabSwitches, fullscreenExits } = req.body;

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
        message: 'Attempt already submitted'
      });
    }

    // Update attempt with tab switches and fullscreen exits
    attempt.endTime = new Date();
    attempt.submitTime = new Date();
    attempt.status = 'submitted';
    
    if (typeof tabSwitches === 'number') {
      attempt.tabSwitches = tabSwitches;
    }
    if (typeof fullscreenExits === 'number') {
      attempt.fullscreenExits = fullscreenExits;
    }
    
    await attempt.save();

    // Get all submissions
    const submissions = await CodeSubmission.find({ attemptId: attempt._id })
      .populate('problemId', 'title problemNumber marks');

    res.status(200).json({
      success: true,
      message: 'Coding assessment submitted successfully',
      results: {
        attempt,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        submissions
      }
    });
  } catch (error) {
    console.error('Submit coding assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: error.message
    });
  }
};

/**
 * @desc    Get coding assessment results
 * @route   GET /api/lms/student/coding/results/:assessmentId
 * @access  Private (Student only)
 */
const getCodingResults = async (req, res) => {
  try {
    const student = req.user;

    // Find student's attempt for this assessment
    const attempt = await StudentAttempt.findOne({
      studentId: student._id,
      assessmentId: req.params.assessmentId,
      status: 'submitted'
    }).populate('assessmentId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No submitted attempt found for this assessment'
      });
    }

    // Get all code submissions for this attempt
    const submissions = await CodeSubmission.find({ attemptId: attempt._id })
      .populate('problemId', 'title problemNumber marks testCases')
      .sort({ 'problemId.problemNumber': 1, createdAt: -1 });

    // Get all problems
    const problems = await CodingProblem.find({ assessmentId: req.params.assessmentId })
      .sort({ problemNumber: 1 });

    // Calculate per-problem results
    const problemResults = problems.map(problem => {
      // Get all submissions for this problem
      const problemSubmissions = submissions.filter(
        s => s.problemId._id.toString() === problem._id.toString()
      );

      // Get best submission (most test cases passed, then fastest execution)
      const bestSubmission = problemSubmissions.sort((a, b) => {
        if (b.passedTestCases !== a.passedTestCases) {
          return b.passedTestCases - a.passedTestCases;
        }
        return a.executionTime - b.executionTime;
      })[0];

      return {
        problem_number: problem.problemNumber,
        title: problem.title,
        marks: problem.marks,
        submissions_count: problemSubmissions.length,
        best_submission: bestSubmission ? {
          language: bestSubmission.language,
          status: bestSubmission.status,
          passed_test_cases: bestSubmission.passedTestCases,
          total_test_cases: bestSubmission.totalTestCases,
          score: bestSubmission.score,
          execution_time: bestSubmission.executionTime,
          memory_used: bestSubmission.memoryUsed,
          code: bestSubmission.code,
          test_results: bestSubmission.testResults
        } : null
      };
    });

    // Calculate overall statistics
    const totalTestCases = submissions.reduce((sum, s) => sum + s.totalTestCases, 0);
    const totalPassed = submissions.reduce((sum, s) => sum + s.passedTestCases, 0);

    res.status(200).json({
      success: true,
      results: {
        assessment: {
          title: attempt.assessmentId.title,
          type: attempt.assessmentId.type
        },
        attempt: {
          start_time: attempt.startTime,
          end_time: attempt.endTime,
          time_spent: attempt.timeSpent,
          status: attempt.status
        },
        score: {
          scored_marks: attempt.score,
          total_marks: attempt.totalMarks,
          percentage: attempt.percentage
        },
        statistics: {
          total_problems: problems.length,
          total_submissions: submissions.length,
          total_test_cases: totalTestCases,
          total_passed: totalPassed
        },
        problems: problemResults
      }
    });
  } catch (error) {
    console.error('Get coding results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * Get detailed coding assessment results for admin reports
 * Returns question-wise breakdown for each student
 */
const getAdminCodingResults = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.type !== 'Coding') {
      return res.status(400).json({
        success: false,
        message: 'Assessment is not a coding assessment'
      });
    }

    // Get all coding problems for this assessment
    const problems = await CodingProblem.find({ 
      assessmentId: req.params.assessmentId 
    }).sort({ problemNumber: 1 });

    // Get all submitted attempts for this assessment with student details
    const attempts = await StudentAttempt.find({ 
      assessmentId: req.params.assessmentId,
      status: 'submitted'
    })
    .populate('studentId', 'name email registrationNumber year semester section')
    .sort({ submitTime: -1 });

    // Build detailed results for each student
    const results = await Promise.all(attempts.map(async (attempt) => {
      // Get all submissions for this attempt
      const submissions = await CodeSubmission.find({ 
        attemptId: attempt._id 
      }).sort({ problemId: 1, submittedAt: -1 });

      // Group submissions by problem and get best submission for each
      const problemMap = new Map();
      
      for (const submission of submissions) {
        const problemIdStr = submission.problemId.toString();
        
        if (!problemMap.has(problemIdStr)) {
          problemMap.set(problemIdStr, submission);
        } else {
          const existing = problemMap.get(problemIdStr);
          // Keep submission with more passed test cases
          if (submission.passedTestCases > existing.passedTestCases) {
            problemMap.set(problemIdStr, submission);
          }
        }
      }

      // Build question-wise results
      const questions = [];
      let totalPassedTests = 0;
      let totalTests = 0;

      for (const problem of problems) {
        const problemIdStr = problem._id.toString();
        const submission = problemMap.get(problemIdStr);

        if (submission) {
          questions.push({
            questionNumber: problem.problemNumber,
            passed: submission.passedTestCases,
            total: submission.totalTestCases
          });
          totalPassedTests += submission.passedTestCases;
          totalTests += submission.totalTestCases;
        } else {
          // No submission for this problem
          questions.push({
            questionNumber: problem.problemNumber,
            passed: 0,
            total: problem.testCases.length
          });
          totalTests += problem.testCases.length;
        }
      }

      // Calculate score: each test case = 10 points
      const totalScore = totalPassedTests * 10;
      const maxScore = totalTests * 10;

      // Calculate time spent in readable format
      let timeSpent = '0s';
      if (attempt.startTime && attempt.endTime) {
        const seconds = Math.floor((attempt.endTime - attempt.startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timeSpent = minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
      }

      return {
        registrationNo: attempt.studentId.registrationNumber,
        name: attempt.studentId.name,
        year: attempt.studentId.year,
        semester: attempt.studentId.semester,
        section: attempt.studentId.section,
        questions,
        totalScore,
        maxScore,
        timeSpent,
        tabSwitches: attempt.tabSwitches || 0,
        fullscreenExits: attempt.fullscreenExits || 0
      };
    }));

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Get admin coding results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding results',
      error: error.message
    });
  }
};

module.exports = {
  getCodingProblems,
  submitCode,
  getSubmissionStatus,
  getProblemSubmissions,
  submitCodingAssessment,
  getCodingResults,
  getAdminCodingResults
};
