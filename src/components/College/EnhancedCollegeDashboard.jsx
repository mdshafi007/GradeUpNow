import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';

const EnhancedCollegeDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { collegeUser, collegeLogout } = useCollegeUser();

  // Get college name from college code
  const getCollegeName = (collegeCode) => {
    const collegeNames = {
      'mit': 'Manipal Institute of Technology',
      'vit': 'Vellore Institute of Technology',
      'iit': 'Indian Institute of Technology Delhi',
      'vignan': 'Vignan University'
    };
    return collegeNames[collegeCode] || 'College Portal';
  };

  useEffect(() => {
    // Check if college user is authenticated
    if (!collegeUser) {
      navigate('/college-portal');
    } else {
      setLoading(false);
    }
  }, [navigate, collegeUser]);

  const handleLogout = async () => {
    try {
      await collegeLogout();
      navigate('/college-portal');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!collegeUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {collegeUser ? getCollegeName(collegeUser.collegeCode) : 'College Portal'}
              </h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Powered by GradeUpNow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{collegeUser.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
            <nav className="space-y-2">

              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeSection === 'profile'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>👤</span>
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">


            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Student Profile
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Roll Number</label>
                        <p className="text-lg text-gray-900 mt-1">{collegeUser.rollNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Name</label>
                        <p className="text-lg text-gray-900 mt-1">{collegeUser.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Email</label>
                        <p className="text-lg text-gray-900 mt-1">{collegeUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Department</label>
                        <p className="text-lg text-gray-900 mt-1">{collegeUser.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Year</label>
                        <p className="text-lg text-gray-900 mt-1">{collegeUser.year}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">Overall Grade</label>
                        <p className="text-lg font-semibold text-blue-600 mt-1">{collegeUser.overallGrade}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Academic Progress
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {collegeUser.coursesEnrolled || 0}
                      </div>
                      <div className="text-sm text-gray-600">Courses Enrolled</div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {collegeUser.assignmentsDue || 0}
                      </div>
                      <div className="text-sm text-gray-600">Assignments Due</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCollegeDashboard;