import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import usePageTitle from '../hooks/usePageTitle';
import './AboutUs.css';

const AboutUs = () => {
  usePageTitle('About Us - GradeUpNow');
  const { theme } = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const features = [
    {
      icon: '📍',
      title: 'Personalized Roadmaps',
      description: 'Get your own guided learning path — tailored to your branch, year, and goals. No confusion, just clear direction.'
    },
    {
      icon: '🤖',
      title: 'AI Doubt Assistant',
      description: 'Stuck on a concept? Ask instantly. Our AI assistant helps you solve doubts for coding, subjects, and beyond — anytime, anywhere.'
    },
    {
      icon: '💼',
      title: 'Career & Internship Updates',
      description: 'Never miss an opportunity. Get real-time updates on jobs, internships, hackathons, and placement contests.'
    },
    {
      icon: '📝',
      title: 'Your Digital Notebook',
      description: 'Take notes while learning and save them securely. Access everything later without losing a single page.'
    },
    {
      icon: '🎓',
      title: 'Study Made Simple',
      description: 'We break down complex topics into simple, step-by-step lessons — so you can understand faster and remember longer.'
    }
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Simple Header */}
        <div className="about-header">
          <h1 className="about-title">About GradeUpNow</h1>
          <p className="about-intro">
            GradeUpNow offers everything a B.Tech student needs — from coding tutorials and computer science subjects to essential tech skills like LinkedIn and GitHub.
          </p>
          <p className="about-tagline">
            Smart, AI-powered tools and clear, practical content to help you learn, grow, and stay ahead.
          </p>
        </div>

        {/* Roadmap Style Features */}
        <div className="roadmap-section">
          {features.map((feature, index) => (
            <div key={index} className="roadmap-item">
              <div className="roadmap-line">
                <div className="roadmap-dot">{feature.icon}</div>
                {index !== features.length - 1 && <div className="roadmap-connector"></div>}
              </div>
              <div className="roadmap-content">
                <h3 className="roadmap-title">{feature.title}</h3>
                <p className="roadmap-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Simple CTA */}
        <div className="about-cta">
          <Link to="/courses" className="cta-btn">Start Learning</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
