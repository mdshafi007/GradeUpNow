import React, { useState, useEffect } from 'react';
import cTutorialContent from '../../data/c-tutorial-content.json';
import styles from './CTutorial.module.css';

const CTutorial = () => {
  const { title, sections } = cTutorialContent;
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id);

  const handleSectionClick = (id) => {
    setActiveSectionId(id);
  };

  const activeSection = sections.find(section => section.id === activeSectionId);

  return (
    <div className={styles.container}>
      {/* Sidebar for "In this article" */}
      <div className={styles.sidebar}>
        <h3>In this article</h3>
        <ul>
          {sections.map(section => (
            <li key={section.id}>
              <a
                href="#"
                className={activeSectionId === section.id ? styles.activeLink : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionClick(section.id);
                }}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <h1>{title}</h1>
        {activeSection ? (
          <div key={activeSection.id} id={activeSection.id}>
            <h2>{activeSection.title}</h2>
            {activeSection.content.map((item, index) => (
              <div key={index}>
                <h3>{item.title}</h3>
                {item.type === 'text' ? (
                  <p>{item.content}</p>
                ) : (
                  <pre className={styles.codeBlock}>
                    <code>{item.content}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Select a section from the sidebar.</p>
        )}
      </div>
    </div>
  );
};

export default CTutorial;
