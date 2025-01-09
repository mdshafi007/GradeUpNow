import React from "react";
import Navbar from "./components/navbar/Navbar";
import HeroSection from "./components/herosection/Herosection";
import Featuredtutorials from "./components/toptutorials/Featuredtutorials";
import WhyGradeUpNow from "./components/services/WhyGradeUpNow";
import Footer from "./components/Footer/Footer";


function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Featuredtutorials />
      <WhyGradeUpNow />
      <Footer />
      
    
    </>
  );
}

export default App;
