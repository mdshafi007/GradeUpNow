import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './lms_admin_coding_editor.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminCodingEditor = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssessmentAndProblems();
  }, [assessmentId]);

  const loadAssessmentAndProblems = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      // Load assessment details
      const assessmentResponse = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assessmentData = await assessmentResponse.json();
      if (!assessmentResponse.ok) throw new Error(assessmentData.message);
      setAssessment(assessmentData.assessment);

      // Try to load existing problems
      try {
        const problemsResponse = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}/coding-problems-list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (problemsResponse.ok) {
          const problemsData = await problemsResponse.json();
          if (problemsData.problems && problemsData.problems.length > 0) {
            // Format problems from MongoDB to match our state structure
            const formattedProblems = problemsData.problems.map(p => ({
              _id: p._id,
              title: p.title,
              description: p.description,
              constraints: p.constraints || '',
              input_format: p.inputFormat || '',
              output_format: p.outputFormat || '',
              problemNumber: p.problemNumber,
              marks: p.marks || 10,
              difficulty: p.difficulty || 'Medium',
              test_cases: (p.testCases || []).map(tc => ({
                _id: tc._id,
                input: tc.input,
                expected_output: tc.expectedOutput,
                is_hidden: tc.isHidden
              }))
            }));
            setProblems(formattedProblems);
            return;
          }
        }
      } catch (error) {
        console.log('No existing problems found, creating new');
      }

      // Create first problem if none exist
      addNewProblem();
    } catch (error) {
      console.error('Error loading coding test:', error);
      toast.error('Failed to load coding test');
    } finally {
      setLoading(false);
    }
  };

  const addNewProblem = () => {
    const newProblem = {
      _id: `temp-${Date.now()}`,
      title: '',
      description: '',
      constraints: '',
      input_format: '',
      output_format: '',
      problemNumber: problems.length + 1,
      marks: 10,
      difficulty: 'Medium',
      test_cases: [{
        _id: `tc-temp-${Date.now()}`,
        input: '',
        expected_output: '',
        is_hidden: false
      }],
      isNew: true
    };
    setProblems([...problems, newProblem]);
    setSelectedProblemIndex(problems.length);
  };

  const updateProblem = (field, value) => {
    const updatedProblems = [...problems];
    updatedProblems[selectedProblemIndex] = {
      ...updatedProblems[selectedProblemIndex],
      [field]: value
    };
    setProblems(updatedProblems);
  };

  const addTestCase = () => {
    const updatedProblems = [...problems];
    const currentProblem = updatedProblems[selectedProblemIndex];
    const testCases = currentProblem.test_cases || [];
    
    testCases.push({
      _id: `tc-temp-${Date.now()}`,
      input: '',
      expected_output: '',
      is_hidden: false,
      isNew: true
    });

    updatedProblems[selectedProblemIndex].test_cases = testCases;
    setProblems(updatedProblems);
  };

  const updateTestCase = (testCaseIndex, field, value) => {
    const updatedProblems = [...problems];
    const testCases = updatedProblems[selectedProblemIndex].test_cases;
    testCases[testCaseIndex] = {
      ...testCases[testCaseIndex],
      [field]: value
    };
    setProblems(updatedProblems);
  };

  const deleteTestCase = (testCaseIndex) => {
    const currentProblem = problems[selectedProblemIndex];
    if (currentProblem.test_cases.length === 1) {
      toast.warning('Problem must have at least one test case');
      return;
    }

    if (window.confirm('Are you sure you want to delete this test case?')) {
      // Remove from local state (will be saved when clicking Save All)
      const updatedProblems = [...problems];
      updatedProblems[selectedProblemIndex].test_cases = 
        currentProblem.test_cases.filter((_, i) => i !== testCaseIndex);
      setProblems(updatedProblems);
      toast.success('Test case will be deleted when you save');
    }
  };

  const deleteProblem = (index) => {
    if (problems.length === 1) {
      toast.warning('Test must have at least one problem');
      return;
    }

    if (window.confirm('Are you sure you want to delete this problem?')) {
      // Remove from local state (will be saved when clicking Save All)
      const updatedProblems = problems.filter((_, i) => i !== index);
      setProblems(updatedProblems);

      // Adjust selected index
      if (selectedProblemIndex >= updatedProblems.length) {
        setSelectedProblemIndex(Math.max(0, updatedProblems.length - 1));
      }
      
      toast.success('Problem will be deleted when you save');
    }
  };

  const saveTest = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('lms_token');
      
      // Validate all problems
      for (const problem of problems) {
        if (!problem.title.trim()) {
          toast.warning('All problems must have a title');
          setSaving(false);
          return;
        }
        if (!problem.description.trim()) {
          toast.warning('All problems must have a description');
          setSaving(false);
          return;
        }
        if (!problem.constraints.trim()) {
          toast.warning('All problems must have constraints');
          setSaving(false);
          return;
        }
        if (!problem.input_format || !problem.input_format.trim()) {
          toast.warning('All problems must have input format');
          setSaving(false);
          return;
        }
        if (!problem.output_format || !problem.output_format.trim()) {
          toast.warning('All problems must have output format');
          setSaving(false);
          return;
        }
        if (!problem.test_cases || problem.test_cases.length === 0) {
          toast.warning('All problems must have at least one test case');
          setSaving(false);
          return;
        }
        for (const tc of problem.test_cases) {
          if (!tc.input.trim() || !tc.expected_output.trim()) {
            toast.warning('All test cases must have input and expected output');
            setSaving(false);
            return;
          }
        }
      }

      // Format problems for MongoDB API
      const formattedProblems = problems.map((problem, index) => ({
        problemNumber: index + 1,
        title: problem.title,
        description: problem.description,
        inputFormat: problem.input_format,
        outputFormat: problem.output_format,
        constraints: problem.constraints,
        sampleInput: problem.test_cases[0].input, // First test case as sample
        sampleOutput: problem.test_cases[0].expected_output,
        testCases: problem.test_cases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expected_output,
          isHidden: tc.is_hidden
        })),
        marks: problem.marks || 10,
        difficulty: problem.difficulty || 'Medium'
      }));

      console.log('Saving problems:', formattedProblems);

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}/coding-problems`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ problems: formattedProblems })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save problems');
      }

      toast.success('Coding test saved successfully!');
      navigate('/college/admin/assessments');
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error('Failed to save test: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lms-coding-editor-loading">
        <div className="lms-spinner"></div>
      </div>
    );
  }

  const currentProblem = problems[selectedProblemIndex] || {};
  const testCases = currentProblem.test_cases || [];

  return (
    <div className="lms-coding-editor">
      {/* Header */}
      <div className="lms-coding-header">
        <div className="lms-coding-header-left">
          <button className="lms-back-btn" onClick={() => navigate('/college/admin/assessments')}>
            <FaArrowLeft />
          </button>
          <div>
            <h1>{assessment?.name || 'Coding Test Editor'}</h1>
            <p>Add and manage coding problems</p>
          </div>
        </div>
        <button className="lms-save-test-btn" onClick={saveTest} disabled={saving}>
          <FaSave />
          {saving ? 'Saving...' : 'Save Test'}
        </button>
      </div>

      {/* Main Content */}
      <div className="lms-coding-content">
        {/* Problems Sidebar */}
        <aside className="lms-problems-sidebar">
          <div className="lms-problems-header">
            <h3>Problems</h3>
            <button className="lms-add-problem-btn" onClick={addNewProblem}>
              <FaPlus />
            </button>
          </div>
          <div className="lms-problems-list">
            {problems.map((problem, index) => (
              <div
                key={problem.id}
                className={`lms-problem-item ${selectedProblemIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedProblemIndex(index)}
              >
                Problem {index + 1}
              </div>
            ))}
          </div>
        </aside>

        {/* Problem Editor */}
        <main className="lms-problem-editor">
          <div className="lms-problem-header">
            <h2>Problem {selectedProblemIndex + 1}</h2>
          </div>

          {/* Problem Title */}
          <div className="lms-form-group">
            <label>Problem Title</label>
            <input
              type="text"
              placeholder="e.g., Two Sum Problem"
              value={currentProblem.title || ''}
              onChange={(e) => updateProblem('title', e.target.value)}
            />
          </div>

          {/* Problem Description */}
          <div className="lms-form-group">
            <label>Problem Description</label>
            <textarea
              placeholder="Describe the problem, include examples"
              value={currentProblem.description || ''}
              onChange={(e) => updateProblem('description', e.target.value)}
              rows={6}
            />
          </div>

          {/* Constraints */}
          <div className="lms-form-group">
            <label>Constraints</label>
            <textarea
              placeholder="e.g., 1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9&#10;Time Limit: 2 seconds&#10;Space Limit: 256 MB"
              value={currentProblem.constraints || ''}
              onChange={(e) => updateProblem('constraints', e.target.value)}
              rows={4}
            />
          </div>

          {/* Input Format */}
          <div className="lms-form-group">
            <label>Input Format</label>
            <textarea
              placeholder="e.g., First line contains integer n&#10;Second line contains n space-separated integers"
              value={currentProblem.input_format || ''}
              onChange={(e) => updateProblem('input_format', e.target.value)}
              rows={3}
            />
            <small className="field-hint">Explain how the input is structured</small>
          </div>

          {/* Output Format */}
          <div className="lms-form-group">
            <label>Output Format</label>
            <textarea
              placeholder="e.g., Print a single integer - the result"
              value={currentProblem.output_format || ''}
              onChange={(e) => updateProblem('output_format', e.target.value)}
              rows={3}
            />
            <small className="field-hint">Explain what output is expected</small>
          </div>

          {/* Test Cases */}
          <div className="lms-test-cases-section">
            <div className="lms-test-cases-header">
              <h3>Test Cases</h3>
              <button className="lms-add-testcase-btn" onClick={addTestCase}>
                <FaPlus />
                Add Test Case
              </button>
            </div>

            {testCases.map((testCase, index) => (
              <div key={testCase.id} className="lms-test-case-card">
                <div className="lms-test-case-header">
                  <h4>Test Case {index + 1}</h4>
                  <button
                    className="lms-delete-tc-btn"
                    onClick={() => deleteTestCase(index)}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="lms-test-case-row">
                  <div className="lms-test-case-col">
                    <label>Input</label>
                    <textarea
                      placeholder="e.g., nums = [2,7,11,15], target = 9"
                      value={testCase.input || ''}
                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="lms-test-case-col">
                    <label>Expected Output</label>
                    <textarea
                      placeholder="e.g., [0,1]"
                      value={testCase.expected_output || ''}
                      onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="lms-hidden-checkbox">
                  <input
                    type="checkbox"
                    id={`hidden-${index}`}
                    checked={testCase.is_hidden || false}
                    onChange={(e) => updateTestCase(index, 'is_hidden', e.target.checked)}
                  />
                  <label htmlFor={`hidden-${index}`}>Hidden test case (not visible to students)</label>
                </div>
              </div>
            ))}
          </div>

          {/* Delete Problem Button */}
          {problems.length > 1 && (
            <button
              className="lms-delete-problem-btn"
              onClick={() => deleteProblem(selectedProblemIndex)}
            >
              <FaTrash />
              Delete Problem
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default LMSAdminCodingEditor;
