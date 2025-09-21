import React from "react";
import Navbar from "./components/navbar/Navbar";
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import Featuredtutorials from "./components/toptutorials/Featuredtutorials";
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";
import HeroSect from "./components/herosection/HeroSect";
import Notes from "./components/Notes/Notes";
import Notescomp from "./components/Notes/Notescomp";
import Card from "./components/Card/CoursePage";
import LoginForm from "./components/login/LoginForm";
import SignUp from "./components/signup/SignUp";
import CoursePage from "./components/Card/CoursePage";
import CourseDetail from "./components/Card/CourseDetail";
import CourseTutorial from "./components/Card/CourseTutorial";
import CourseNotes from "./components/Card/CourseNotes";
import CTutorial from "./components/tutorials/CTutorialSimple";
import CPPTutorial from "./components/tutorials/CPPTutorial";
import PythonTutorial from "./components/tutorials/PythonTutorial";
import JavaTutorial from "./components/tutorials/JavaTutorial";
import CourseTutorialViewer from "./components/tutorials/Tutorials";
import Profile from "./components/profile/ProfileClean";
import ProfileSetupSimple from "./components/profile/ProfileSetupClean";
import Notifications from "./components/Notifications/Notifications";
import Practice from "./components/Practice/Practice";
import Quiz from "./components/Quiz/Quiz";
import QuizResult from "./components/Quiz/QuizResult";
import NotFound from "./components/404/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { UserProvider } from "./context/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home=()=>{
  return(
    <>
     <HeroSect />
     <Featuredtutorials />
     <WhyGradeUpNow />
    </>
  )
}

// Component to conditionally render footer based on route
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Routes where footer should NOT be displayed (tutorial pages with custom layouts)
  const noFooterRoutes = [
    '/course/c-programming/tutorial',
    '/course/cprogramming/tutorial',
    '/course/cpp-programming/tutorial',
    '/course/c++-programming/tutorial',
    '/course/cplusplus/tutorial',
    '/course/python-programming/tutorial',
    '/course/python/tutorial',
    '/course/java-programming/tutorial',
    '/course/java/tutorial',
    '/courses/c-programming',
    '/courses/cprogramming',
    '/courses/cpp-programming',
    '/courses/c++-programming',
    '/courses/cplusplus',
    '/courses/python-programming',
    '/courses/python',
    '/courses/java-programming',
    '/courses/java',
    '/c-tutorial',
    '/cpp-tutorial',
    '/c++-tutorial',
    '/python-tutorial',
    '/java-tutorial',
    '/tutorial/c-programming',
    '/tutorial/cprogramming',
    '/tutorial/cpp-programming',
    '/tutorial/c++-programming',
    '/tutorial/cplusplus',
    '/tutorial/python-programming',
    '/tutorial/python',
    '/tutorial/java-programming',
    '/tutorial/java'
  ];
  
  // Check if current path should not show footer
  const shouldHideFooter = noFooterRoutes.includes(location.pathname);
  
  return shouldHideFooter ? null : <Footer />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="your-client-id">
      <UserProvider>
        <Router>
          <div className="App">
            <ScrollToTop />
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
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/courses" element={<CoursePage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              {/* Specific C Programming routes - these must come before the general :courseId/tutorial route */}
              <Route path="/course/c-programming/tutorial" element={<CTutorial />} />
              <Route path="/course/cprogramming/tutorial" element={<CTutorial />} />
              
              {/* Specific C++ Programming routes */}
              <Route path="/course/cpp-programming/tutorial" element={<CPPTutorial />} />
              <Route path="/course/c++-programming/tutorial" element={<CPPTutorial />} />
              <Route path="/course/cplusplus/tutorial" element={<CPPTutorial />} />
              
              {/* Specific Python Programming routes */}
              <Route path="/course/python-programming/tutorial" element={<PythonTutorial />} />
              <Route path="/course/python/tutorial" element={<PythonTutorial />} />
              
              {/* Specific Java Programming routes */}
              <Route path="/course/java-programming/tutorial" element={<JavaTutorial />} />
              <Route path="/course/java/tutorial" element={<JavaTutorial />} />
              
              {/* General tutorial route for all other courses */}
              <Route path="/course/:courseId/tutorial" element={<CourseTutorial />} />
              <Route path="/course/:courseId/notes" element={<CourseNotes />} />
              <Route path="/courses/c-programming" element={<CTutorial />} />
              <Route path="/courses/cprogramming" element={<CTutorial />} />
              
              {/* C++ course routes */}
              <Route path="/courses/cpp-programming" element={<CPPTutorial />} />
              <Route path="/courses/c++-programming" element={<CPPTutorial />} />
              <Route path="/courses/cplusplus" element={<CPPTutorial />} />
              
              {/* Python course routes */}
              <Route path="/courses/python-programming" element={<PythonTutorial />} />
              <Route path="/courses/python" element={<PythonTutorial />} />
              
              {/* Java course routes */}
              <Route path="/courses/java-programming" element={<JavaTutorial />} />
              <Route path="/courses/java" element={<JavaTutorial />} />
              
              <Route path="/c-tutorial" element={<CTutorial />} />
              <Route path="/cpp-tutorial" element={<CPPTutorial />} />
              <Route path="/c++-tutorial" element={<CPPTutorial />} />
              <Route path="/python-tutorial" element={<PythonTutorial />} />
              <Route path="/java-tutorial" element={<JavaTutorial />} />
              <Route path="/tutorial/c-programming" element={<CTutorial />} />
              <Route path="/tutorial/cprogramming" element={<CTutorial />} />
              <Route path="/tutorial/cpp-programming" element={<CPPTutorial />} />
              <Route path="/tutorial/c++-programming" element={<CPPTutorial />} />
              <Route path="/tutorial/cplusplus" element={<CPPTutorial />} />
              <Route path="/tutorial/python-programming" element={<PythonTutorial />} />
              <Route path="/tutorial/python" element={<PythonTutorial />} />
              <Route path="/tutorial/java-programming" element={<JavaTutorial />} />
              <Route path="/tutorial/java" element={<JavaTutorial />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/quiz/:quizType" element={<Quiz />} />
              <Route path="/quiz/:quizType/result/:resultId" element={<QuizResult />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-setup" element={<ProfileSetupSimple />} />
              {/* Catch-all route for any unmatched URLs - show 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalFooter />
          </div>
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
