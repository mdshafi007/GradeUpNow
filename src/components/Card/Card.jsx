import { useState } from 'react';
import { Info } from 'lucide-react';
import { Code2, Globe, Binary, Database, FileCode, Braces, Phone as Python, Coffee, Hash, Cog, Rocket, Zap, MonitorSmartphone, Server, BookOpen, Cpu, Brain, KeyRound, TableProperties, Database as DbIcon, FileJson, Flame, Box, Boxes, Disc3, Container, Timer } from 'lucide-react';
import './card.css';

function Card() {
    const [showMore, setShowMore] = useState({
        pl: false,
        wd: false,
        cs: false,
        db: false,
    });

    const [modalData, setModalData] = useState({
        isVisible: false,
        content: '',
    });

    const toggleViewMore = (section) => {
        setShowMore((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const openModal = (content) => {
        setModalData({
            isVisible: true,
            content,
        });
    };

    const closeModal = () => {
        setModalData({
            isVisible: false,
            content: '',
        });
    };

    const renderCards = (cards, section) => {
        const cardBackgroundColors = [
            'bg-blue-100',
            'bg-green-100',
            'bg-yellow-100',
            'bg-purple-100',
            'bg-red-100',
            'bg-pink-100',
            'bg-indigo-100',
            'bg-teal-100',
        ];

        return cards.slice(0, showMore[section] ? cards.length : 4).map((card, index) => (
            <div
            className={`card ${cardBackgroundColors[index % cardBackgroundColors.length]}`}
            >
                <button className="info-button" onClick={() => openModal(card.info)}>
                    <Info size={20} />
                </button>
                <div className="card-icon">{card.icon}</div>
                <h2 className="card-title">{card.title}</h2>
                <p className="card-text">{card.text}</p>
                <button className="button">GradeUp</button>
            </div>
        ));
    };

    const programmingLanguages = [
        { title: 'C', text: 'Beginner to Pro', icon: <Code2 size={32} />, info: 'C is a general-purpose programming language.' },
        { title: 'C++', text: 'Beginner to Pro', icon: <FileCode size={32} />, info: 'C++ is widely used in system and application software.' },
        { title: 'Python', text: 'Beginner to Pro', icon: <Python size={32} />, info: 'Python is known for its simplicity and readability.' },
        { title: 'Java', text: 'Beginner to Pro', icon: <Coffee size={32} />, info: 'Java is a versatile and platform-independent language.' },
    ];

    const webDevelopment = [
        { title: 'HTML', text: 'Beginner to Pro', icon: <Globe size={32} />, info: 'HTML is the standard markup language for web pages.' },
        { title: 'CSS', text: 'Beginner to Pro', icon: <Braces size={32} />, info: 'CSS is used to style HTML elements on a webpage.' },
        { title: 'JavaScript', text: 'Beginner to Pro', icon: <Binary size={32} /> },
        { title: 'React', text: 'Beginner to Pro', icon: <MonitorSmartphone size={32} /> },
    ];

    const computerScience = [
        { title: 'Computer Networks', text: 'Beginner to Pro', icon: <Globe size={32} /> },
        { title: 'DBMS', text: 'Beginner to Pro', icon: <Database size={32} /> },
        { title: 'Compiler Design', text: 'Beginner to Pro', icon: <FileCode size={32} /> },
        { title: 'Operating Systems', text: 'Beginner to Pro', icon: <Cpu size={32} /> },
        { title: 'Algorithms', text: 'Beginner to Pro', icon: <Binary size={32} /> },
        { title: 'Data Structures', text: 'Beginner to Pro', icon: <Boxes size={32} /> },
        { title: 'AI & ML', text: 'Beginner to Pro', icon: <Brain size={32} /> },
        { title: 'Cryptography', text: 'Beginner to Pro', icon: <KeyRound size={32} /> },
    ];

    const databases = [
        { title: 'SQL', text: 'Beginner to Pro', icon: <TableProperties size={32} /> },
        { title: 'MongoDB', text: 'Beginner to Pro', icon: <DbIcon size={32} /> },
    ];

    const sections = [
        { title: 'Programming Languages', data: programmingLanguages, key: 'pl' },
        { title: 'Web Development', data: webDevelopment, key: 'wd' },
        { title: 'Computer Science Courses', data: computerScience, key: 'cs' },
        { title: 'Databases', data: databases, key: 'db' },
    ];

    return (
        <div className="container">
            {sections.map((section) => (
                <section className="section" key={section.key}>
                    <div className="section-header">
                        <h2>{section.title}</h2>
                       
                    </div>
                    <div className="card-grid">
                        {renderCards(section.data, section.key)}
                    </div>
                </section>
            ))}
            {modalData.isVisible && (
                <div   
                      className={`modal-overlay ${modalData.isVisible ? 'visible' : ''}`}

                    onClick={closeModal}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Information</h2>
                        <p>{modalData.content}</p>
                        <button className="modal-close" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Card;