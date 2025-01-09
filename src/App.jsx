import React from "react";
import Navbar from "./components/navbar/Navbar";

import Featuredtutorials from "./components/toptutorials/Featuredtutorials";
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";
import HeroSect from "./components/herosection/HeroSect";


function App() {
  return (
    <>
      <Navbar />
      <HeroSect />
      <Featuredtutorials />
      <WhyGradeUpNow />
      <Footer />
      
    
    </>
  );
}

export default App;
