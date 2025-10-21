import React from "react";
import Navbar from "./components/navbar/Navbar";
import EnhancedCollegeDashboard from './components/College/EnhancedCollegeDashboard';
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import SignUpUltraSimple from "./components/auth/SignUp_ULTRA_SIMPLE";
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";
import HeroSect from "./components/herosection/HeroSect";
import CoursePage from "./components/Card/CoursePage";
import CoursesPage from "./components/Courses/CoursesPageNew";
import CourseDetail from "./components/Card/CourseDetail";
import CourseNotes from "./components/Card/CourseNotes";


import Notifications from "./components/Notifications/Notifications";
import NotFound from "./components/404/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { AdminProvider } from "./context/AdminContext";
import { CollegeUserProvider } from "./context/CollegeUserContext";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminStudent from "./components/Admin/AdminStudent";
import BulkStudentCreator from "./components/Admin/BulkStudentCreator";
import AssessmentsDashboard_lms from "./components/Admin/AssessmentsDashboard_lms";
import QuizCreation_lms from "./components/Admin/QuizCreation_lms";
import QuizManagement_lms from "./components/Admin/QuizManagement_lms";
import QuizAnalytics from "./components/Admin/QuizAnalytics";
import CodingTestCreation_lms from "./components/Admin/CodingTestCreation_lms";
import CodingTestManagement_lms from "./components/Admin/CodingTestManagement_lms";
import CodingTestAnalytics_lms from "./components/Admin/CodingTestAnalytics_lms";
import CollegeLogin from "./components/College/CollegeLogin";
import CollegeDashboard from "./components/College/CollegeDashboardNew";
import QuizTaking_student from "./components/College/QuizTaking_student";
import CodingTestInterface_student from "./components/College/CodingTestInterface_student";
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
  
  // Routes where navbar should NOT be displayed (admin routes)
  const noNavbarRoutes = [
    '/admin/login',
    '/admin/dashboard',
    '/admin/reports',
    '/admin/settings'
  ];
  
  // Check if current path should not show navbar (admin, college, and tutorial routes)
  const shouldHideNavbar = noNavbarRoutes.some(route => location.pathname.startsWith(route.split('/')[1] === 'admin' ? '/admin' : route)) || 
                          location.pathname.startsWith('/college-') ||
                          location.pathname.includes('/tutorial');
  
  return shouldHideNavbar ? null : <Navbar />;
};

// Component to conditionally render footer based on route
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Routes where footer should NOT be displayed (admin routes and tutorial pages)
  const noFooterRoutes = [];
  
  // Check if current path should not show footer (including admin, college, and tutorial routes)
  const shouldHideFooter = noFooterRoutes.includes(location.pathname) || 
                          location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/college-') ||
                          location.pathname.includes('/tutorial');
  
  return shouldHideFooter ? null : <Footer />;
};

function App() {
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
              <Route path="/signup-test" element={<SignUpUltraSimple />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/practice/:topicSlug/test" element={<PracticeTest />} />
              <Route path="/practice/company/accenture" element={<AccentureDetail />} />
              <Route path="/practice/company/tcs-nqt" element={<TCSNQTDetail />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              
              {/* Admin Routes - Isolated with AdminProvider */}
              <Route path="/admin/login" element={
                <AdminProvider>
                  <AdminLogin />
                </AdminProvider>
              } />
              <Route path="/admin/dashboard" element={
                <AdminProvider>
                  <AdminDashboard />
                </AdminProvider>
              } />
              <Route path="/admin/students" element={
                <AdminProvider>
                  <AdminStudent />
                </AdminProvider>
              } />
              <Route path="/admin/bulk-create" element={
                <AdminProvider>
                  <BulkStudentCreator />
                </AdminProvider>
              } />
              <Route path="/admin/assessments" element={
                <AdminProvider>
                  <AssessmentsDashboard_lms />
                </AdminProvider>
              } />
              <Route path="/admin/quiz/create" element={
                <AdminProvider>
                  <QuizCreation_lms />
                </AdminProvider>
              } />
              <Route path="/admin/quiz/manage" element={
                <AdminProvider>
                  <QuizManagement_lms />
                </AdminProvider>
              } />
              <Route path="/admin/quiz/:quizId/analytics" element={
                <AdminProvider>
                  <QuizAnalytics />
                </AdminProvider>
              } />
              <Route path="/admin/coding-test/create" element={
                <AdminProvider>
                  <CodingTestCreation_lms />
                </AdminProvider>
              } />
              <Route path="/admin/coding-test/manage" element={
                <AdminProvider>
                  <CodingTestManagement_lms />
                </AdminProvider>
              } />
              <Route path="/admin/coding-test/:testId/analytics" element={
                <AdminProvider>
                  <CodingTestAnalytics_lms />
                </AdminProvider>
              } />

              
              {/* College Portal Routes - Separate Context */}
              <Route path="/college-portal" element={
                <CollegeUserProvider>
                  <CollegeLogin />
                </CollegeUserProvider>
              } />
              <Route path="/college-dashboard" element={
                <CollegeUserProvider>
                  <CollegeDashboard />
                </CollegeUserProvider>
              } />
              <Route path="/college-dashboard/assessment/:quizId" element={
                <CollegeUserProvider>
                  <QuizTaking_student />
                </CollegeUserProvider>
              } />
              <Route path="/college-dashboard/coding-test/:testId" element={
                <CollegeUserProvider>
                  <CodingTestInterface_student />
                </CollegeUserProvider>
              } />
              
              <Route path="/course/:courseId/notes" element={<CourseNotes />} />
              <Route path="/course/:courseId/tutorial" element={<TutorialViewer />} />

              <Route path="/notifications" element={<Notifications />} />
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
