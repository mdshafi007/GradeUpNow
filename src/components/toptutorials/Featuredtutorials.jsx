// Featuredtutorials.jsx
import React from "react";
import { Code, BookOpen, GitBranch, Globe } from "lucide-react";
import "./Featuredtutorials.css";

const Featuredtutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: "Programming Languages",
      desc: "Learn C, C++, Python, Java and more",
      icon: <Code className="w-6 h-6 text-blue-500" />
    },
    {
      id: 2,
      title: "CS Subjects",
      desc: "Learn Operating Systems, Theory of Computation and more",
      icon: <BookOpen className="w-6 h-6 text-green-500" />
    },
    {
      id: 3,
      title: "Technical Skills",
      desc: "Learn Git, GitHub, LinkedIn and more",
      icon: <GitBranch className="w-6 h-6 text-orange-500" />
    },
    {
      id: 4,
      title: "Web Development",
      desc: "Learn HTML, CSS, JavaScript, ReactJS and more",
      icon: <Globe className="w-6 h-6 text-pink-500" />
    }
  ];
  
  return (
    <div className="featured-tutorials-wrapper">
      <div className="featured-tutorials-container">
        <h2 className="tutorials-title">Tutorials Offered</h2>
        <div className="tutorials-grid">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="tutorial-card">
              <div className="card-content">
                <div className="icon-container">
                  {tutorial.icon}
                </div>
                <h3 className="card-title">{tutorial.title}</h3>
                <p className="card-description">{tutorial.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featuredtutorials;