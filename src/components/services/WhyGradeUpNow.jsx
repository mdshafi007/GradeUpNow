import React from 'react';
import { Brain, BookText, Bell, BookOpen } from 'lucide-react';
import './WhyGradeUpNow.css';

const WhyGradeUpNow = () => {
    const features = [
        {
          icon: <Brain className="feature-icon" />,
          title: "AI Learning Assistant",
          description: "Get quick answers to your questions with AI tailored to your learning needs."
        },
        {
          icon: <BookText className="feature-icon" />,
          title: "Digital Notes Platform",
          description: "Create and access notes easily across all your devices."
        },
        {
          icon: <Bell className="feature-icon" />,
          title: "Opportunity Alerts",
          description: "Stay updated on internships, contests, and events with real-time notifications."
        },
        {
          icon: <BookOpen className="feature-icon" />,
          title: "Clear Learning Content",
          description: "Understand tough topics with content simplified into easy modules."
        }
      ];
      

  return (
    <section className="why-gradeupnow">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why GradeUpNow?</h2>
          <p className="section-description">
            Elevating education through innovation and personalized learning experiences
          </p>
        </div>
        
        <div className="features-list">
          {features.map((feature, index) => (
            <div className="feature-item" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="feature-icon-wrapper">
                {feature.icon}
                <div className="icon-glow"></div>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGradeUpNow;