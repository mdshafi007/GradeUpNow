import React, { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';

const BulkStudentCreator = () => {
  usePageTitle("Bulk Student Creator - Admin");
  const [collegeCode, setCollegeCode] = useState('');
  const [studentsText, setStudentsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Sample format for students
  const sampleFormat = `21CS001,John Doe,Computer Science,2024
21CS002,Jane Smith,Computer Science,2024
21CS003,Bob Johnson,Information Technology,2023`;

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    
    if (!collegeCode.trim() || !studentsText.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Parse student data
      const students = studentsText.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',').map(part => part.trim());
          return {
            rollNumber: parts[0],
            name: parts[1] || '',
            department: parts[2] || '',
            year: parts[3] || ''
          };
        });

      // Validate parsed data
      if (students.length === 0) {
        throw new Error('No valid student data found');
      }

      // Call API to create students
      const response = await fetch('/api/college/bulk-create-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeCode: collegeCode.toLowerCase(),
          students: students
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.message || 'Bulk creation failed');
      }

    } catch (error) {
      console.error('Bulk creation error:', error);
      setError(error.message || 'An error occurred during bulk creation');
    } finally {
      setLoading(false);
    }
  };

  const downloadCredentials = () => {
    if (!results || !results.created) return;

    const csvContent = "Roll Number,Name,Email,Password\n" +
      results.created.map(student => 
        `${student.rollNumber},${student.name},${student.email},${student.password}`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collegeCode}_student_credentials.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f7fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Bulk Student Creator
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#e53e3e',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleBulkCreate}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              College Code
            </label>
            <input
              type="text"
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value)}
              placeholder="e.g., mit, stanford, demo"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Student Data (CSV Format)
            </label>
            <div style={{
              backgroundColor: '#f7fafc',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Format:</strong> RollNumber,Name,Department,Year<br/>
              <strong>Example:</strong><br/>
              <pre style={{ margin: '5px 0', fontSize: '11px' }}>{sampleFormat}</pre>
            </div>
            <textarea
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              placeholder="Enter student data, one per line..."
              rows="10"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#a0aec0' : '#4299e1',
              color: 'white',
              padding: '15px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Creating Students...' : 'Create Students'}
          </button>
        </form>

        {results && (
          <div style={{
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            padding: '20px',
            borderRadius: '6px',
            marginTop: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#22543d',
              marginBottom: '15px'
            }}>
              Bulk Creation Results
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Total:</strong> {results.summary.total}</p>
              <p><strong>Created:</strong> {results.summary.created}</p>
              <p><strong>Failed:</strong> {results.summary.failed}</p>
            </div>

            {results.created && results.created.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <button
                  onClick={downloadCredentials}
                  style={{
                    backgroundColor: '#38a169',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download Credentials (CSV)
                </button>
              </div>
            )}

            {results.created && results.created.length > 0 && (
              <div>
                <h4 style={{ color: '#22543d', marginBottom: '10px' }}>Created Students:</h4>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {results.created.map((student, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}>
                      <strong>{student.rollNumber}</strong> - {student.name}<br/>
                      <span style={{ color: '#666' }}>
                        Email: {student.email} | Password: {student.password}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.errors && results.errors.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: '#e53e3e', marginBottom: '10px' }}>Errors:</h4>
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  backgroundColor: '#fed7d7',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {results.errors.map((error, index) => (
                    <div key={index} style={{ fontSize: '12px', marginBottom: '5px' }}>
                      <strong>{error.rollNumber}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkStudentCreator;