import React from 'react';
import { MapPin, Bot, Briefcase, FileText, GraduationCap } from 'lucide-react';
import './WhyGradeUpNow.css';

const WhyGradeUpNow = () => {
    const whyFeatures = [
        {
            icon: <MapPin className="whysection-icon" />,
            title: "Personalized Roadmaps",
            description: "Get guided learning paths tailored to your branch, year, skills and goals.",
            accent: "whysection-accent-blue"
        },
        {
            icon: <Bot className="whysection-icon" />,
            title: "AI Doubt Assistant",
            description: "Stuck on a problem? Get instant, AI-powered help for programming and subject-related queries.",
            accent: "whysection-accent-purple"
        },
        {
            icon: <Briefcase className="whysection-icon" />,
            title: "Career & Internship Updates",
            description: "Stay ahead with real-time alerts on jobs, internships, hackathons, and contests.",
            accent: "whysection-accent-green"
        },
        {
            icon: <FileText className="whysection-icon" />,
            title: "Your Digital Notebook",
            description: "Take notes while learning, save them securely, and access anytime without losing a single page.",
            accent: "whysection-accent-orange"
        },
        {
            icon: <GraduationCap className="whysection-icon" />,
            title: "Study Made Simple",
            description: "Complex topics explained in the simplest way possible — step-by-step, clear, and student-friendly.",
            accent: "whysection-accent-red"
        }
    ];

    return (
        <section className="whysection">
            <div className="whysection-container">
                <div className="whysection-header">
                    <h2 className="whysection-main-title">Why Choose GradeUpNow?</h2>
                    <p className="whysection-subtitle">Everything you need to excel in your B.Tech journey</p>
                </div>
                <div className="whysection-grid">
                    {whyFeatures.map((feature, index) => (
                        <div className="whysection-card" key={index}>
                            <div className={`whysection-icon-wrapper ${feature.accent}`}>
                                {feature.icon}
                            </div>
                            <div className="whysection-content">
                                <h3 className="whysection-title">{feature.title}</h3>
                                <p className="whysection-description">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="whysection-divider"></div>
        </section>
    );
};

export default WhyGradeUpNow;