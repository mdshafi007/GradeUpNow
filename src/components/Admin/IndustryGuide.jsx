import React from 'react';
import './IndustryGuide.css';

const IndustryGuide = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="guide-overlay">
      <div className="guide-modal">
        <div className="guide-header">
          <h2>🏆 Industry-Standard Coding Test Guide</h2>
          <button className="guide-close" onClick={onClose}>×</button>
        </div>
        
        <div className="guide-content">
          <section className="guide-section">
            <h3>📝 Input/Output Format Standards</h3>
            <div className="guide-example">
              <h4>✅ Correct Format:</h4>
              <div className="code-example">
                <strong>Input Format:</strong><br/>
                First line: integer n (size of array)<br/>
                Second line: n space-separated integers<br/>
                Third line: integer target
              </div>
              <div className="code-example">
                <strong>Test Case Input:</strong><br/>
                4<br/>
                2 7 11 15<br/>
                9
              </div>
              <div className="code-example">
                <strong>Expected Output:</strong><br/>
                0 1
              </div>
            </div>
            
            <div className="guide-example error">
              <h4>❌ Avoid These Formats:</h4>
              <ul>
                <li>Comma-separated: "2,7,11,15"</li>
                <li>Array notation: "[2,7,11,15]"</li>
                <li>Mixed formats in different test cases</li>
              </ul>
            </div>
          </section>

          <section className="guide-section">
            <h3>🧪 Test Case Best Practices</h3>
            <div className="guide-grid">
              <div className="guide-card">
                <h4>Sample Test Cases</h4>
                <ul>
                  <li>✅ Mark as "Sample" and not "Hidden"</li>
                  <li>✅ Include in problem description</li>
                  <li>✅ Students see these during "Run Code"</li>
                  <li>✅ Should cover basic scenarios</li>
                </ul>
              </div>
              
              <div className="guide-card">
                <h4>Hidden Test Cases</h4>
                <ul>
                  <li>✅ Mark as "Hidden" and not "Sample"</li>
                  <li>✅ Cover edge cases</li>
                  <li>✅ Only run during "Submit Solution"</li>
                  <li>✅ Include corner cases</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>💻 Code Template Standards</h3>
            <div className="language-examples">
              <div className="lang-example">
                <h4>C++ Template:</h4>
                <pre>{`#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    
    // Write your solution here
    
    return 0;
}`}</pre>
              </div>
              
              <div className="lang-example">
                <h4>Python Template:</h4>
                <pre>{`# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Write your solution here

# Output result
print(result)`}</pre>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>⚡ Performance Standards</h3>
            <div className="perf-grid">
              <div className="perf-item">
                <strong>Time Limits:</strong>
                <ul>
                  <li>Easy: 1-2 seconds</li>
                  <li>Medium: 2-3 seconds</li>
                  <li>Hard: 3-5 seconds</li>
                </ul>
              </div>
              
              <div className="perf-item">
                <strong>Memory Limits:</strong>
                <ul>
                  <li>Basic: 128 MB</li>
                  <li>Standard: 256 MB</li>
                  <li>Large data: 512 MB</li>
                </ul>
              </div>
              
              <div className="perf-item">
                <strong>Points Distribution:</strong>
                <ul>
                  <li>Easy: 50-100 points</li>
                  <li>Medium: 100-200 points</li>
                  <li>Hard: 200-300 points</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>🔍 Common Mistakes to Avoid</h3>
            <div className="mistakes-list">
              <div className="mistake-item">
                <span className="mistake-icon">❌</span>
                <div>
                  <strong>Inconsistent Input Format</strong>
                  <p>Using different input formats across test cases</p>
                </div>
              </div>
              
              <div className="mistake-item">
                <span className="mistake-icon">❌</span>
                <div>
                  <strong>Missing Edge Cases</strong>
                  <p>Not testing minimum/maximum constraints</p>
                </div>
              </div>
              
              <div className="mistake-item">
                <span className="mistake-icon">❌</span>
                <div>
                  <strong>Wrong Output Format</strong>
                  <p>Extra spaces, newlines, or formatting issues</p>
                </div>
              </div>
              
              <div className="mistake-item">
                <span className="mistake-icon">❌</span>
                <div>
                  <strong>Unrealistic Constraints</strong>
                  <p>Time limits too strict or too lenient</p>
                </div>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>🎯 Validation Checklist</h3>
            <div className="checklist">
              <label><input type="checkbox" /> Input format matches all test cases</label>
              <label><input type="checkbox" /> Output format is consistent</label>
              <label><input type="checkbox" /> At least one sample test case</label>
              <label><input type="checkbox" /> Multiple hidden test cases</label>
              <label><input type="checkbox" /> Edge cases covered</label>
              <label><input type="checkbox" /> Code templates work with input format</label>
              <label><input type="checkbox" /> Time limits are reasonable</label>
              <label><input type="checkbox" /> Problem statement is clear</label>
            </div>
          </section>
        </div>
        
        <div className="guide-footer">
          <button className="btn-primary" onClick={onClose}>
            Got it! Let's Create Perfect Tests 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndustryGuide;