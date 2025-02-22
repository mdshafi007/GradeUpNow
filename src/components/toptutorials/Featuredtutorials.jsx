// Featuredtutorials.jsx
import React from "react";
import { Code, BookOpen, GitBranch, Globe } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Featuredtutorials.css';

const Featuredtutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: "Programming Languages",
      desc: "Learn C, C++, Python, Java and more",
      icon: <Code size={24} />,
      iconColor: "text-primary"
    },
    {
      id: 2,
      title: "CS Subjects",
      desc: "Learn Operating Systems, Theory of Computation and more",
      icon: <BookOpen size={24} />,
      iconColor: "text-success"
    },
    {
      id: 3,
      title: "Technical Skills",
      desc: "Learn Git, GitHub, LinkedIn and more",
      icon: <GitBranch size={24} />,
      iconColor: "text-warning"
    },
    {
      id: 4,
      title: "Web Development",
      desc: "Learn HTML, CSS, JavaScript, ReactJS and more",
      icon: <Globe size={24} />,
      iconColor: "text-danger"
    }
  ];
  
  return (
    <div className="featured-tutorials py-5">
      <div className="container">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h2 className="tutorial-title d-inline-block position-relative pb-3 mb-4">Tutorials Offered</h2>
          </div>
        </div>
        
        <div className="row">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="col-md-6 col-lg-3 mb-4">
              <div className="card tutorial-card h-100 shadow-sm border-0 rounded-4 transition">
                <div className="card-body d-flex flex-column align-items-center text-center p-4">
                  <div className={`icon-circle d-flex align-items-center justify-content-center mb-3 ${tutorial.iconColor}`}>
                    {tutorial.icon}
                  </div>
                  <h3 className="card-title h5 fw-bold mb-3">{tutorial.title}</h3>
                  <p className="card-text text-muted">{tutorial.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featuredtutorials;