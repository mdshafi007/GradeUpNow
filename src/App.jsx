import React from "react";
import Navbar from "./components/navbar/Navbar";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
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
import CourseTutorialViewer from "./components/tutorials/Tutorials";
import Profile from "./components/profile/ProfileClean";
import ProfileSetupSimple from "./components/profile/ProfileSetupClean";
import Notifications from "./components/Notifications/Notifications";
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
              <Route path="/course/c-programming/tutorial" element={<CTutorial />} />
              <Route path="/course/cprogramming/tutorial" element={<CTutorial />} />
              <Route path="/course/:courseId/tutorial" element={<CourseTutorialViewer />} />
              <Route path="/course/:courseId/notes" element={<CourseNotes />} />
              <Route path="/courses/c-programming" element={<CTutorial />} />
              <Route path="/courses/cprogramming" element={<CTutorial />} />
              <Route path="/c-tutorial" element={<CTutorial />} />
              <Route path="/tutorial/c-programming" element={<CTutorial />} />
              <Route path="/tutorial/cprogramming" element={<CTutorial />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-setup" element={<ProfileSetupSimple />} />
              {/* Catch-all route for any unmatched URLs - show 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
