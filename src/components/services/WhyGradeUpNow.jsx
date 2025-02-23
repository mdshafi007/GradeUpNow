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
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-title h3 fw-bold mb-4">Why GradeUpNow?</h2>
                </div>
                
                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div className="col-12 col-md-6 col-lg-3" key={index}>
                            <div className="card feature-card border-0 shadow-sm h-100">
                                <div className="card-body text-center d-flex flex-column align-items-center p-4">
                                    <div className="feature-icon-wrapper mb-4">
                                        {feature.icon}
                                        <div className="icon-glow"></div>
                                    </div>
                                    <h3 className="feature-title h5">{feature.title}</h3>
                                    <p className="feature-description text-muted mb-0">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyGradeUpNow;