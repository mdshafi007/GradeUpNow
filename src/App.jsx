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
import CTutorial from "./components/tutorials/CTutorial";
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
              <Route path="/notes" element={<Notes />} />
              <Route path="/courses" element={<CoursePage />} />
              <Route path="/courses/c-programming" element={<CTutorial />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
