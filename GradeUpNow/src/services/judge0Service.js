/**
 * Judge0 API Integration Service
 * Professional code execution service with error handling
 */

class Judge0Service {
  constructor() {
    this.baseURL = import.meta.env.VITE_JUDGE0_BASE_URL || 'http://31.97.203.93:2358';
    // No API key needed for self-hosted Judge0
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get language ID for Judge0 API
   */
  getLanguageId(language) {
    const languageMap = {
      'javascript': 63,  // Node.js (14.15.4)
      'python': 71,      // Python (3.8.1)
      'java': 62,        // Java (OpenJDK 13.0.1)
      'cpp': 54,         // C++ (GCC 9.2.0)
      'c': 50,           // C (GCC 9.2.0)
    };
    return languageMap[language] || 63;
  }

  /**
   * Submit code for execution
   */
  async submitCode(sourceCode, language, input = '') {
    try {
      const languageId = this.getLanguageId(language);
      
      const submission = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: input,
        cpu_time_limit: 5,
        memory_limit: 256000,
      };

      console.log('🚀 Submitting to Judge0:', {
        url: `${this.baseURL}/submissions`,
        language,
        languageId,
        codeLength: sourceCode.length
      });

      const response = await fetch(`${this.baseURL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(submission),
        mode: 'cors'
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Judge0 API Error:', errorText);
        throw new Error(`Judge0 API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Judge0 Result:', result);
      return this.processResult(result);

    } catch (error) {
      console.error('❌ Judge0 submission error:', error);
      throw new Error(`Code execution failed: ${error.message}`);
      console.error('Judge0 submission error:', error);
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  /**
   * Process execution result
   */
  processResult(result) {
    const statusMap = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error (SIGSEGV)',
      8: 'Runtime Error (SIGXFSZ)',
      9: 'Runtime Error (SIGFPE)',
      10: 'Runtime Error (SIGABRT)',
      11: 'Runtime Error (NZEC)',
      12: 'Runtime Error (Other)',
      13: 'Internal Error',
      14: 'Exec Format Error'
    };

    const status = statusMap[result.status?.id] || 'Unknown';
    const isSuccess = result.status?.id === 3; // Accepted

    // Prepare execution result
    const executionResult = {
      success: isSuccess,
      status: status,
      statusId: result.status?.id,
      output: null,
      error: null,
      executionTime: result.time ? `${result.time}s` : null,
      memory: result.memory ? `${(result.memory / 1024).toFixed(1)} MB` : null,
      compileOutput: result.compile_output || null
    };

    if (isSuccess) {
      // Successful execution
      executionResult.output = result.stdout || '(No output)';
    } else {
      // Handle different types of errors
      if (result.status?.id === 6) {
        // Compilation Error
        executionResult.error = result.compile_output || 'Compilation failed';
      } else if (result.stderr) {
        // Runtime Error
        executionResult.error = result.stderr;
      } else if (result.status?.description) {
        // Other errors
        executionResult.error = result.status.description;
      } else {
        executionResult.error = 'Execution failed';
      }
    }

    console.log('Judge0 Result:', executionResult);
    return executionResult;
  }

  /**
   * Execute code with specific input (for test case execution)
   */
  async executeWithInput(sourceCode, language, input = '') {
    return await this.submitCode(sourceCode, language, input);
  }

  /**
   * Get available languages from Judge0
   */
  async getLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/languages`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get languages:', error);
      return [];
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const testCode = 'console.log("Hello from Judge0!");';
      const result = await this.submitCode(testCode, 'javascript');
      return result.success && result.output?.includes('Hello from Judge0!');
    } catch (error) {
      console.error('Judge0 connection test failed:', error);
      return false;
    }
  }

  /**
   * Execute code with test cases
   */
  async executeWithTestCases(sourceCode, language, testCases = []) {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const result = await this.submitCode(sourceCode, language, testCase.input);
        
        // Compare output with expected
        const passed = result.success && 
          result.output?.trim() === testCase.expectedOutput?.trim();

        results.push({
          testCaseIndex: i,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          error: result.error,
          executionTime: result.executionTime,
          memory: result.memory
        });

      } catch (error) {
        results.push({
          testCaseIndex: i,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: null,
          error: error.message,
          executionTime: null,
          memory: null
        });
      }
    }

    return {
      totalTestCases: testCases.length,
      passedTestCases: results.filter(r => r.passed).length,
      results
    };
  }
}

// Export singleton instance
export const judge0Service = new Judge0Service();

export default judge0Service;