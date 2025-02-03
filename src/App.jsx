import React from "react";
import Navbar from "./components/navbar/Navbar";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Featuredtutorials from "./components/toptutorials/Featuredtutorials";
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";
import HeroSect from "./components/herosection/HeroSect";
import Notes from "./components/Notes/Notes";
import Notescomp from "./components/Notes/Notescomp";
import Card from "./components/Card/Card";


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
      <Router>
         <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/courses" element={<Card />} />

           
          </Routes>
          <Footer />
         </div>
      </Router>
      

  );
}

export default App;
