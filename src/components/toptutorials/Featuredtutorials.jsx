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
      desc: "Master C, C++, Python, Java and more with hands-on projects",
      icon: <Code size={32} />,
      iconColor: "text-primary",
      gradient: "gradient-primary"
    },
    {
      id: 2,
      title: "CS Subjects",
      desc: "Deep dive into Operating Systems, Theory of Computation and more",
      icon: <BookOpen size={32} />,
      iconColor: "text-success",
      gradient: "gradient-success"
    },
    {
      id: 3,
      title: "Technical Skills",
      desc: "Learn Git, GitHub, LinkedIn and essential developer tools",
      icon: <GitBranch size={32} />,
      iconColor: "text-warning",
      gradient: "gradient-warning"
    },
    {
      id: 4,
      title: "Web Development",
      desc: "Build modern web apps with HTML, CSS, JavaScript, and ReactJS",
      icon: <Globe size={32} />,
      iconColor: "text-danger",
      gradient: "gradient-danger"
    }
  ];
  
  return (
    <section className="featured-tutorials py-5">
      <div className="container">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h2 className="section-title1">Explore Our Courses</h2>
          </div>
        </div>
        
        <div className="row g-4">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="col-md-6 col-lg-3">
              <div className="tutorial-card">
                <div className={`card-icon-wrapper ${tutorial.gradient}`}>
                  {tutorial.icon}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{tutorial.title}</h3>
                  <p className="card-description">{tutorial.desc}</p>
                  <a href="/courses" className="card-link">
                    Learn More <i className="fas fa-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featuredtutorials;