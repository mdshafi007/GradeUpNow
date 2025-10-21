import React, { forwardRef, useImperativeHandle } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import judge0Service from '../../services/judge0Service';
import InlineTestResults_student from './InlineTestResults_student';
import ResizablePanels_student from './ResizablePanels_student';
import './CodeEditor_student.css';

const CodeEditor_student = forwardRef(({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onRunCode,
  onSubmitSolution,
  isRunning,
  isExecutingTestCases,
  executionResults,
  testCaseResults,
  showTestCaseResults,
  supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c']
}, ref) => {

  useImperativeHandle(ref, () => ({
    focus: () => {
      // Focus functionality if needed
    },
    getCode: () => code
  }));

  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'javascript':
        return [javascript()];
      case 'python':
        return [python()];
      case 'java':
        return [java()];
      case 'cpp':
      case 'c':
        return [cpp()];
      default:
        return [javascript()];
    }
  };

  const getLanguageDisplayName = (lang) => {
    const names = {
      javascript: 'JavaScript',
      python: 'Python 3',
      java: 'Java',
      cpp: 'C++',
      c: 'C'
    };
    return names[lang] || lang;
  };

  const getLanguageId = (lang) => {
    // Judge0 language IDs
    const ids = {
      javascript: 63, // Node.js
      python: 71,     // Python 3
      java: 62,       // Java
      cpp: 54,        // C++
      c: 50           // C
    };
    return ids[lang] || 63;
  };

  const handleSubmitCode = () => {
    if (onSubmitSolution) {
      onSubmitSolution();
    }
  };

  const renderExecutionResults = () => {
    if (!executionResults) return null;

    return (
      <div className="execution-results-student">
        <div className="results-header-student">
          <h4>Execution Results</h4>
        </div>
        <div className="results-content-student">
          {executionResults.success ? (
            <div className="results-success-student">
              <div className="output-section-student">
                <label>Output:</label>
                <pre className="output-text-student">{executionResults.output}</pre>
              </div>
              {executionResults.executionTime && (
                <div className="stats-section-student">
                  <span className="stat-item-student">
                    ⏱️ Time: {executionResults.executionTime}
                  </span>
                  {executionResults.memory && (
                    <span className="stat-item-student">
                      💾 Memory: {executionResults.memory}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="results-error-student">
              <div className="error-section-student">
                <label>Error:</label>
                <pre className="error-text-student">{executionResults.error}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const editorPanel = (
    <div className="editor-panel-student">
      {/* Editor header with language selector */}
      <div className="editor-header-student">
        <div className="language-selector-student">
          <label htmlFor="language-select-student">Language:</label>
          <select
            id="language-select-student"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="language-dropdown-student"
          >
            {supportedLanguages.map(lang => (
              <option key={lang} value={lang}>
                {getLanguageDisplayName(lang)}
              </option>
            ))}
          </select>
        </div>
        <div className="editor-actions-student">
          {/* Run Code button moved to footer */}
        </div>
      </div>

      {/* Code editor */}
      <div className="editor-wrapper-student">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[
            ...getLanguageExtension(language),
            keymap.of([indentWithTab]),
            EditorView.theme({
              '&': {
                fontSize: '14px',
                fontFamily: 'Consolas, "Courier New", monospace'
              },
              '.cm-content': {
                padding: '16px',
                minHeight: '100%'
              },
              '.cm-focused': {
                outline: 'none'
              },
              '.cm-editor': {
                borderRadius: '0'
              },
              '.cm-scroller': {
                fontFamily: 'Consolas, "Courier New", monospace'
              }
            })
          ]}
          onChange={(value) => onCodeChange(value)}
          className="code-mirror-student"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
            tabSize: 2,
            indentUnit: 2,
            rectangularSelection: true,
            crosshairCursor: true
          }}
        />
      </div>

      {/* Footer */}
      <div className="editor-footer-student">
        <div className="footer-info-student">
          <span className="language-info-student">
            {getLanguageDisplayName(language)} • Judge0 ID: {getLanguageId(language)}
          </span>
        </div>
        <div className="footer-actions-student">
          <button
            onClick={onRunCode}
            disabled={isRunning || isExecutingTestCases || !code.trim()}
            className="run-button-student"
          >
            {isRunning || isExecutingTestCases ? (
              <>
                <span className="button-spinner-student"></span>
                {isExecutingTestCases ? 'Testing...' : 'Running...'}
              </>
            ) : (
              'Run Code'
            )}
          </button>
          <button
            onClick={handleSubmitCode}
            className="submit-solution-button-student"
            disabled={!code.trim() || isRunning || isExecutingTestCases}
          >
            {isExecutingTestCases ? 'Testing...' : 'Submit Code'}
          </button>
        </div>
      </div>
    </div>
  );

  const resultsPanel = (
    <div className="results-panel-student">
      {/* Execution results */}
      {renderExecutionResults()}

      {/* Inline Test Case Results */}
      <InlineTestResults_student
        results={testCaseResults}
        show={showTestCaseResults}
      />
    </div>
  );

  return (
    <div className="code-editor-container-student">
      <ResizablePanels_student
        topPanel={editorPanel}
        bottomPanel={resultsPanel}
        initialSplitPercentage={65}
        minTopHeight={250}
        minBottomHeight={100}
      />
    </div>
  );
});

CodeEditor_student.displayName = 'CodeEditor_student';

export default CodeEditor_student;