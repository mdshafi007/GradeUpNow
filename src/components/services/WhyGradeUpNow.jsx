import React from 'react';
import { BookText, Bell, BookOpen, Code } from 'lucide-react';
import './WhyGradeUpNow.css';

const WhyGradeUpNow = () => {
    const features = [
        {
            icon: <Code className="feature-icon" />,
            title: "Interactive Tutorials",
            description: "Learn programming through hands-on tutorials and practical examples designed for B.Tech students.",
            gradient: "gradient-purple"
        },
        {
            icon: <BookText className="feature-icon" />,
            title: "Digital Notes Platform",
            description: "Create, organize, and access your notes seamlessly across all devices with our intuitive digital platform.",
            gradient: "gradient-blue"
        },
        {
            icon: <Bell className="feature-icon" />,
            title: "Opportunity Alerts",
            description: "Never miss important opportunities with real-time notifications for internships, contests, and events.",
            gradient: "gradient-orange"
        },
        {
            icon: <BookOpen className="feature-icon" />,
            title: "Clear Learning Content",
            description: "Master complex topics with our simplified, step-by-step learning modules designed for B.Tech students.",
            gradient: "gradient-green"
        }
    ];

    return (
        <section className="why-choose-us">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-title">Why Choose GradeUpNow?</h2>
                </div>
                
                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div className="col-12 col-md-6 col-lg-3" key={index}>
                            <div className="feature-card">
                                <div className={`feature-icon-wrapper ${feature.gradient}`}>
                                    {feature.icon}
                                </div>
                                <div className="feature-content">
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
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