/**
 * Test Case Execution Service
 * Handles running code against multiple test cases with proper result formatting
 */

import judge0Service from './judge0Service.js';

class TestCaseExecutionService {
  constructor() {
    this.judge0 = judge0Service;
  }

  /**
   * Execute code against sample test cases (visible to student)
   * @param {string} sourceCode - The code to execute
   * @param {string} language - Programming language
   * @param {Array} testCases - Array of test case objects
   * @returns {Object} Execution results with test case status
   */
  async runAgainstSampleTestCases(sourceCode, language, testCases) {
    // Only run sample test cases (isSample: true) or non-hidden test cases for "Run Code"
    const sampleTestCases = testCases.filter(tc => tc.isSample === true && tc.isHidden !== true);
    console.log('🔍 Sample test cases for Run Code:', sampleTestCases.length, 'out of', testCases.length);
    console.log('🔍 Sample test case details:', sampleTestCases.map(tc => ({ 
      input: tc.input, 
      isSample: tc.isSample, 
      isHidden: tc.isHidden 
    })));
    return await this.executeTestCases(sourceCode, language, sampleTestCases, 'sample');
  }

  /**
   * Execute code against all test cases (including hidden ones)
   * @param {string} sourceCode - The code to execute  
   * @param {string} language - Programming language
   * @param {Array} testCases - Array of test case objects
   * @returns {Object} Execution results with all test case status
   */
  async submitAgainstAllTestCases(sourceCode, language, testCases) {
    // Run ALL test cases for "Submit Solution" - both sample and hidden
    console.log('🚀 Submit Solution - Running ALL test cases:', testCases.length);
    console.log('🚀 All test case details:', testCases.map(tc => ({ 
      input: tc.input, 
      expected: tc.expectedOutput,
      isSample: tc.isSample, 
      isHidden: tc.isHidden 
    })));
    return await this.executeTestCases(sourceCode, language, testCases, 'submit');
  }

  /**
   * Execute code against provided test cases
   * @param {string} sourceCode - The code to execute
   * @param {string} language - Programming language  
   * @param {Array} testCases - Test cases to run
   * @param {string} executionType - 'sample' or 'submit'
   * @returns {Object} Structured execution results
   */
  async executeTestCases(sourceCode, language, testCases, executionType) {
    const results = {
      success: true,
      executionType,
      totalTestCases: testCases.length,
      passedTestCases: 0,
      failedTestCases: 0,
      testCaseResults: [],
      overallStatus: 'pending',
      executionTime: null,
      memory: null,
      error: null
    };

    if (!testCases || testCases.length === 0) {
      results.success = false;
      results.error = 'No test cases available';
      results.overallStatus = 'error';
      return results;
    }

    try {
      // Execute code against each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result = await this.executeCodeWithInput(sourceCode, language, testCase.input);
        
        const testCaseResult = {
          testCaseNumber: i + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          passed: false,
          executionTime: result.executionTime,
          memory: result.memory,
          error: result.error,
          isHidden: testCase.isHidden || false,
          isSample: testCase.isSample || false
        };

        // Check if output matches expected (normalize whitespace for competitive programming)
        if (result.success && result.output) {
          const actualTrimmed = result.output.toString().trim().replace(/\s+/g, ' ');
          const expectedTrimmed = testCase.expectedOutput.toString().trim().replace(/\s+/g, ' ');
          testCaseResult.passed = actualTrimmed === expectedTrimmed;
          
          // Enhanced logging for debugging
          if (!testCaseResult.passed) {
            console.log(`❌ Test Case ${i + 1} Failed:`);
            console.log(`   Input: ${JSON.stringify(testCase.input)}`);
            console.log(`   Expected: "${expectedTrimmed}"`);
            console.log(`   Actual: "${actualTrimmed}"`);
            console.log(`   Raw Output: "${result.output}"`);
          } else {
            console.log(`✅ Test Case ${i + 1} Passed`);
          }
        }

        if (testCaseResult.passed) {
          results.passedTestCases++;
        } else {
          results.failedTestCases++;
        }

        results.testCaseResults.push(testCaseResult);
        
        // Update overall execution stats (use first successful execution stats)
        if (result.success && !results.executionTime) {
          results.executionTime = result.executionTime;
          results.memory = result.memory;
        }
      }

      // Determine overall status
      if (results.passedTestCases === results.totalTestCases) {
        results.overallStatus = 'all_passed';
      } else if (results.passedTestCases > 0) {
        results.overallStatus = 'partial_passed';
      } else {
        results.overallStatus = 'all_failed';
      }

    } catch (error) {
      console.error('Test case execution error:', error);
      results.success = false;
      results.error = error.message;
      results.overallStatus = 'error';
    }

    return results;
  }

  /**
   * Execute code with specific input using Judge0
   * @param {string} sourceCode - The code to execute
   * @param {string} language - Programming language
   * @param {string} input - Input data for the code
   * @returns {Object} Execution result
   */
  async executeCodeWithInput(sourceCode, language, input) {
    try {
      return await this.judge0.executeWithInput(sourceCode, language, input);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: null,
        executionTime: null,
        memory: null
      };
    }
  }
}

export default TestCaseExecutionService;