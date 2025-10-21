import React from 'react';
import './ProblemStatement_student.css';

const formatProblemStatement = (text) => {
  if (!text) return '';
  
  let formattedText = text;
  
  // Handle different types of formatting based on content
  
  // 1. Convert line breaks to proper HTML breaks
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  // 2. Detect and format tables (Symbol | Value patterns)
  if (formattedText.includes('Symbol') && formattedText.includes('Value')) {
    // Look for patterns like "I | 1", "V | 5", etc.
    const lines = formattedText.split('<br>');
    let tableStartIndex = -1;
    let tableEndIndex = -1;
    
    // Find table boundaries
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('Symbol') && line.includes('Value')) {
        tableStartIndex = i;
      }
      if (tableStartIndex !== -1 && line.match(/^[A-Z]\s+\d+$/)) {
        tableEndIndex = i;
      }
    }
    
    if (tableStartIndex !== -1) {
      // Create table HTML
      let tableHTML = '<div class="symbol-table"><div class="table-header"><div class="table-cell header">Symbol</div><div class="table-cell header">Value</div></div>';
      
      // Extract symbol-value pairs
      const symbolValuePairs = [
        ['I', '1'], ['V', '5'], ['X', '10'], ['L', '50'], 
        ['C', '100'], ['D', '500'], ['M', '1000']
      ];
      
      symbolValuePairs.forEach(([symbol, value]) => {
        tableHTML += `<div class="table-row"><div class="table-cell symbol">${symbol}</div><div class="table-cell value">${value}</div></div>`;
      });
      
      tableHTML += '</div>';
      
      // Replace the table section with formatted table
      const beforeTable = lines.slice(0, tableStartIndex).join('<br>');
      const afterTable = lines.slice(tableEndIndex + 1).join('<br>');
      
      formattedText = beforeTable + '<br>' + tableHTML + '<br>' + afterTable;
    }
  }
  
  // 3. Highlight Roman numerals
  formattedText = formattedText.replace(/\b([IVXLCDM]{2,})\b/g, '<code class="roman-numeral">$1</code>');
  
  // 4. Highlight single Roman numeral symbols in context
  formattedText = formattedText.replace(/\b([IVXLCDM])\s*\(/g, '<code class="symbol-highlight">$1</code> (');
  
  // 5. Highlight numbers
  formattedText = formattedText.replace(/\b(\d+)\b/g, '<span class="number-highlight">$1</span>');
  
  // 6. Format examples
  formattedText = formattedText.replace(/For example,/gi, '<br><strong>For example,</strong>');
  
  // 7. Format bullet points or lists
  formattedText = formattedText.replace(/•\s*/g, '<li>');
  if (formattedText.includes('<li>')) {
    formattedText = formattedText.replace(/(<li>.*?)(<br>|$)/g, '$1</li>');
    formattedText = formattedText.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
  }
  
  // 8. Clean up extra breaks
  formattedText = formattedText.replace(/<br><br>/g, '<br>');
  formattedText = formattedText.replace(/^<br>/, '');
  formattedText = formattedText.replace(/<br>$/, '');
  
  return formattedText;
};

const ProblemStatement_student = ({ question, currentIndex, totalQuestions, onNavigateQuestion }) => {
  if (!question) {
    return (
      <div className="problem-statement-container-student">
        <div className="problem-loading-student">
          <p>Loading problem...</p>
        </div>
      </div>
    );
  }

  const renderExamples = () => {
    if (!question.testCases || question.testCases.length === 0) {
      return null;
    }

    // Show only sample test cases (non-hidden ones)
    const sampleCases = question.testCases.filter(tc => tc.isSample || !tc.isHidden);

    return sampleCases.map((testCase, index) => (
      <div key={index} className="example-card-student">
        <div className="example-header-student">
          <h4>Example {index + 1}</h4>
        </div>
        <div className="example-content-student">
          <div className="example-section-student">
            <label className="example-label-student">Input:</label>
            <div className="example-code-block-student">
              <pre>{testCase.input}</pre>
            </div>
          </div>
          <div className="example-section-student">
            <label className="example-label-student">Output:</label>
            <div className="example-code-block-student">
              <pre>{testCase.expectedOutput}</pre>
            </div>
          </div>
          {testCase.explanation && (
            <div className="example-section-student">
              <label className="example-label-student">Explanation:</label>
              <div className="example-explanation-student">
                <p>{testCase.explanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderConstraints = () => {
    if (!question.constraints) return null;

    return (
      <div className="constraints-section-student">
        <h4 className="constraints-title-student">Constraints</h4>
        <div className="constraints-content-student">
          <pre>{question.constraints}</pre>
        </div>
      </div>
    );
  };

  const renderInputOutput = () => {
    return (
      <div className="input-output-section-student">
        {question.inputFormat && (
          <div className="format-block-student">
            <h4 className="format-title-student">Input Format</h4>
            <div className="format-content-student">
              <p>{question.inputFormat}</p>
            </div>
          </div>
        )}
        
        {question.outputFormat && (
          <div className="format-block-student">
            <h4 className="format-title-student">Output Format</h4>
            <div className="format-content-student">
              <p>{question.outputFormat}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="problem-statement-container-student">
      {/* Problem header */}
      <div className="problem-header-student">
        <div className="problem-title-section-student">
          <div className="problem-title-row-student">
            <h1 className="problem-title-student">{question.questionName || question.title}</h1>
            <span className="problem-number-indicator-end-student">
              Problem {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <div className="problem-meta-student">
            <span className="points-badge-student">
              {question.points || 10} points
            </span>
          </div>
        </div>
        
        {/* Question Navigation - Right below problem header */}
        {totalQuestions > 1 && (
          <div className="question-navigation-header-student">
            <button
              onClick={() => onNavigateQuestion && onNavigateQuestion('prev')}
              disabled={currentIndex === 0}
              className="nav-question-btn-student prev-btn-student"
            >
              ← Previous Question
            </button>
            
            <button
              onClick={() => onNavigateQuestion && onNavigateQuestion('next')}
              disabled={currentIndex === totalQuestions - 1}
              className="nav-question-btn-student next-btn-student"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>

      {/* Problem statement */}
      <div className="problem-content-student">
        <div className="problem-description-student">
          <div className="problem-text-student">
            <div dangerouslySetInnerHTML={{ __html: formatProblemStatement(question.problemStatement || question.description) }} />
          </div>
        </div>

        {/* Input/Output format */}
        {renderInputOutput()}

        {/* Examples */}
        {question.testCases && question.testCases.some(tc => tc.isSample || !tc.isHidden) && (
          <div className="examples-section-student">
            <h3 className="section-title-student">Examples</h3>
            <div className="examples-container-student">
              {renderExamples()}
            </div>
          </div>
        )}

        {/* Constraints */}
        {renderConstraints()}
      </div>

    </div>
  );
};

export default ProblemStatement_student;