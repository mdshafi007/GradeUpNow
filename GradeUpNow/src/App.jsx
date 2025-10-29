import React from "react";
import Navbar from "./components/navbar/Navbar";
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContextNew"; 
import { Analytics } from "@vercel/analytics/react";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import AuthCallback from "./components/auth/AuthCallbackNew"; 
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";
import HeroSect from "./components/herosection/HeroSect";

import CoursesPage from "./components/Courses/CoursesPageNew";
import CourseDetail from "./components/Card/CourseDetail";
import CourseNotes from "./components/Card/CourseNotes";



import Notifications from "./components/Notifications/Notifications";
import NotFound from "./components/404/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePageTitle from "./hooks/usePageTitle";
import Profile from "./components/profile/Profile";
import Notes from "./components/Notes/Notes";
import TutorialViewer from "./components/Tutorial_N/TutorialViewer";
import Practice from "./components/Practice/Practice";
import PracticeTest from "./components/Practice/PracticeTest";
import AccentureDetail from "./components/Practice/Companies/AccentureDetail";
import TCSNQTDetail from "./components/Practice/Companies/TCSNQTDetail";
import AboutUs from "./pages/AboutUs";

// LMS Imports
import LMSLogin from "./LMS/shared/lms_login";
import LMSAdminLayout from "./LMS/admin/lms_admin_layout";
import LMSAdminStudents from "./LMS/admin/lms_admin_students";
import LMSAdminAssessments from "./LMS/admin/lms_admin_assessments";
import LMSAdminQuizEditor from "./LMS/admin/lms_admin_quiz_editor";
import LMSAdminCodingEditor from "./LMS/admin/lms_admin_coding_editor";
import LMSAdminReports from "./LMS/admin/lms_admin_reports";
import LMSStudentDashboard from "./LMS/student/lms_student_dashboard";
import LMSStudentAssessments from "./LMS/student/lms_student_assessments";
import LMSStudentProfile from "./LMS/student/lms_student_profile";
import LMSStudentQuiz from "./LMS/student/lms_student_quiz";
import LMSStudentCodingTest from "./LMS/student/lms_student_codingtest";
import LMSStudentCodingResults from "./LMS/student/lms_student_coding_results";

const Home=()=>{
  usePageTitle("Home - Learn, Practice, Excel");
  return(
    <>
     <HeroSect />
     <WhyGradeUpNow />
    </>
  )
}

// Component to conditionally render navbar based on route
const ConditionalNavbar = () => {
  const location = useLocation();
  
  // Routes where navbar should NOT be displayed
  const noNavbarRoutes = [];
  
  // Check if current path should not show navbar (tutorial routes or college portal)
  const shouldHideNavbar = location.pathname.includes('/tutorial') || 
                          location.pathname.includes('/college');
  
  return shouldHideNavbar ? null : <Navbar />;
};

// Component to conditionally render footer based on route
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Routes where footer should NOT be displayed (tutorial pages and college portal)
  const noFooterRoutes = [];
  
  // Check if current path should not show footer (tutorial routes or college portal)
  const shouldHideFooter = noFooterRoutes.includes(location.pathname) || 
                          location.pathname.includes('/tutorial') ||
                          location.pathname.includes('/college');
  
  return shouldHideFooter ? null : <Footer />;
};

function App() {
  // Redirect from Vercel domain to custom domain
  React.useEffect(() => {
    const currentHost = window.location.hostname;
    const isVercelDomain = currentHost.includes('vercel.app');
    const isCustomDomain = currentHost === 'gradeupnow.app' || currentHost === 'www.gradeupnow.app';
    
    // Only redirect in production (not localhost)
    if (isVercelDomain && !currentHost.includes('localhost')) {
      const newUrl = window.location.href.replace(currentHost, 'gradeupnow.app');
      console.log('🔄 Redirecting from Vercel domain to custom domain:', newUrl);
      window.location.replace(newUrl);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
            <div className="App">
              <ScrollToTop />
              <Analytics />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <ConditionalNavbar />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/practice/:topicSlug/test" element={<PracticeTest />} />
              <Route path="/practice/company/accenture" element={<AccentureDetail />} />
              <Route path="/practice/company/tcs-nqt" element={<TCSNQTDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId/notes" element={<CourseNotes />} />
              <Route path="/course/:courseId/tutorial" element={<TutorialViewer />} />

              <Route path="/notifications" element={<Notifications />} />
              
              {/* College Portal Routes */}
              <Route path="/college/login" element={<LMSLogin />} />
              <Route path="/college/admin" element={<LMSAdminLayout />}>
                <Route path="students" element={<LMSAdminStudents />} />
                <Route path="assessments" element={<LMSAdminAssessments />} />
                <Route path="assessments/:assessmentId/quiz-editor" element={<LMSAdminQuizEditor />} />
                <Route path="assessments/:assessmentId/coding-editor" element={<LMSAdminCodingEditor />} />
                <Route path="reports" element={<LMSAdminReports />} />
              </Route>
              <Route path="/college/student" element={<LMSStudentDashboard />}>
                <Route path="assessments" element={<LMSStudentAssessments />} />
                <Route path="profile" element={<LMSStudentProfile />} />
              </Route>
              <Route path="/college/student/quiz/:assessmentId" element={<LMSStudentQuiz />} />
              <Route path="/college/student/coding/:assessmentId" element={<LMSStudentCodingTest />} />
              <Route path="/college/student/coding-results/:assessmentId" element={<LMSStudentCodingResults />} />
              
              {/* Catch-all route for any unmatched URLs - show 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalFooter />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
