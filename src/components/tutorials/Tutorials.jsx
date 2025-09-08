import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Book, 
  ChevronRight, 
  ChevronDown, 
  Menu,
  CheckCircle,
  Circle,
  Clock,
  Copy
} from 'lucide-react';
import './Tutorials.css';

const CourseTutorialViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false); // Start with false to avoid SSR issues
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState('intro-c');
  const [isMobile, setIsMobile] = useState(false); // Start with false to avoid SSR issues

  // Set initial state based on screen size after component mounts
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // On initial load: expanded for desktop, collapsed for mobile
      // On resize: only force collapse on mobile, let user control desktop state
      if (mobile) {
        setLeftSidebarExpanded(false);
      } else {
        // On desktop, start expanded (only on initial load)
        setLeftSidebarExpanded(true);
      }
    };

    // Set initial state
    checkScreenSize();

    // Add resize listener that only affects mobile state
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarExpanded(false); // Force collapse on mobile
      }
      // Don't change desktop state during resize - let user control it
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Course data mapping - this would come from Firestore
  const courseDataMap = {
    'c-programming': {
      title: 'C Programming',
      currentModule: 'Module 1',
      currentLesson: 'Introduction to C',
      modules: [
        {
          id: 'module-1',
          title: 'Module 1: C Fundamentals',
          expanded: true,
          lessons: [
            { id: 'intro-c', title: 'Introduction to C', completed: true, duration: '10 min' },
            { id: 'variables-datatypes', title: 'Variables and Data Types', completed: false, duration: '15 min' },
            { id: 'operators', title: 'Operators', completed: false, duration: '20 min' }
          ]
        },
        {
          id: 'module-2',
          title: 'Module 2: Control Structures',
          expanded: false,
          lessons: [
            { id: 'conditionals', title: 'If-Else Statements', completed: false, duration: '18 min' },
            { id: 'loops', title: 'Loops in C', completed: false, duration: '25 min' },
            { id: 'switch', title: 'Switch Statements', completed: false, duration: '15 min' }
          ]
        },
        {
          id: 'module-3',
          title: 'Module 3: Functions',
          expanded: false,
          lessons: [
            { id: 'functions-intro', title: 'Introduction to Functions', completed: false, duration: '20 min' },
            { id: 'parameters', title: 'Function Parameters', completed: false, duration: '22 min' }
          ]
        },
        {
          id: 'module-4',
          title: 'Module 4: Arrays & Pointers',
          expanded: false,
          lessons: [
            { id: 'arrays', title: 'Arrays in C', completed: false, duration: '25 min' },
            { id: 'pointers', title: 'Introduction to Pointers', completed: false, duration: '30 min' }
          ]
        }
      ],
      progress: {
        overall: 35,
        completed: 5,
        total: 12
      }
    },
    'python-programming': {
      title: 'Python Programming',
      currentModule: 'Module 1',
      currentLesson: 'Introduction to Python',
      modules: [
        {
          id: 'module-1',
          title: 'Module 1: Python Basics',
          expanded: true,
          lessons: [
            { id: 'intro-python', title: 'Introduction to Python', completed: true, duration: '12 min' },
            { id: 'variables-python', title: 'Variables and Types', completed: false, duration: '18 min' },
            { id: 'strings', title: 'Working with Strings', completed: false, duration: '22 min' }
          ]
        }
        // Add more modules...
      ],
      progress: {
        overall: 25,
        completed: 3,
        total: 15
      }
    }
    // Add more courses...
  };

  const courseData = courseDataMap[courseId] || courseDataMap['c-programming'];

  // Sample lesson content - this would come from Firestore
  const lessonContent = {
    'intro-c': {
      title: 'Introduction to C Programming',
      description: 'Learn the fundamentals of C programming language and its history',
      objectives: [
        'Understand the history and importance of C programming',
        'Set up C development environment', 
        'Write your first C program'
      ],
      content: `C is a general-purpose programming language that was developed in the early 1970s by Dennis Ritchie at Bell Labs. It has become one of the most widely used programming languages in the world.

C is known for its efficiency, flexibility, and portability. It provides low-level access to memory and system resources while maintaining readability and structure.`,
      codeExample: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
    },
    'variables-datatypes': {
      title: 'Variables and Data Types',
      description: 'Learn about different data types and how to declare variables in C',
      objectives: [
        'Understand basic data types in C (int, float, char, double)',
        'Learn variable declaration and initialization',
        'Practice using different data types in programs'
      ],
      content: `Variables in C are containers that store data values. C provides several basic data types:

• int: Stores integers (whole numbers) like 5, -10, 1000
• float: Stores floating point numbers like 3.14, -2.5
• char: Stores single characters like 'A', 'z', '$'
• double: Stores double precision floating point numbers

Before using a variable, you must declare it by specifying its type and name.`,
      codeExample: `#include <stdio.h>

int main() {
    // Variable declarations
    int age = 25;
    float height = 5.9;
    char grade = 'A';
    double salary = 50000.75;
    
    // Printing variables
    printf("Age: %d\\n", age);
    printf("Height: %.1f\\n", height);
    printf("Grade: %c\\n", grade);
    printf("Salary: %.2f\\n", salary);
    
    return 0;
}`
    },
    'operators': {
      title: 'Operators in C',
      description: 'Master different types of operators and their usage in C programming',
      objectives: [
        'Learn arithmetic operators (+, -, *, /, %)',
        'Understand comparison and logical operators',
        'Practice operator precedence and associativity'
      ],
      content: `Operators in C are symbols that perform operations on variables and values. C provides several types of operators:

• Arithmetic Operators: +, -, *, /, % (modulus)
• Comparison Operators: ==, !=, <, >, <=, >=
• Logical Operators: && (AND), || (OR), ! (NOT)
• Assignment Operators: =, +=, -=, *=, /=

Understanding operator precedence is crucial for writing correct expressions.`,
      codeExample: `#include <stdio.h>

int main() {
    int a = 10, b = 3;
    
    // Arithmetic operators
    printf("Addition: %d + %d = %d\\n", a, b, a + b);
    printf("Subtraction: %d - %d = %d\\n", a, b, a - b);
    printf("Multiplication: %d * %d = %d\\n", a, b, a * b);
    printf("Division: %d / %d = %d\\n", a, b, a / b);
    printf("Modulus: %d %% %d = %d\\n", a, b, a % b);
    
    // Comparison operators
    printf("Is %d greater than %d? %s\\n", a, b, (a > b) ? "Yes" : "No");
    
    return 0;
}`
    },
    'conditionals': {
      title: 'If-Else Statements',
      description: 'Learn how to make decisions in your programs using conditional statements',
      objectives: [
        'Understand if, else if, and else statements',
        'Learn nested conditional statements',
        'Practice writing decision-making programs'
      ],
      content: `Conditional statements allow your program to make decisions based on certain conditions. C provides several conditional structures:

• if statement: Executes code if condition is true
• if-else statement: Executes one block if true, another if false
• if-else if-else: Allows multiple conditions to be checked
• Nested if: if statements inside other if statements

Conditions are expressions that evaluate to true (non-zero) or false (zero).`,
      codeExample: `#include <stdio.h>

int main() {
    int score = 85;
    
    // Simple if-else
    if (score >= 90) {
        printf("Grade: A\\n");
    } else if (score >= 80) {
        printf("Grade: B\\n");
    } else if (score >= 70) {
        printf("Grade: C\\n");
    } else if (score >= 60) {
        printf("Grade: D\\n");
    } else {
        printf("Grade: F\\n");
    }
    
    // Nested if example
    if (score >= 60) {
        if (score >= 90) {
            printf("Excellent work!\\n");
        } else {
            printf("Good job!\\n");
        }
    } else {
        printf("Need improvement\\n");
    }
    
    return 0;
}`
    },
    'loops': {
      title: 'Loops in C',
      description: 'Master repetitive execution using for, while, and do-while loops',
      objectives: [
        'Understand for, while, and do-while loops',
        'Learn when to use each type of loop',
        'Practice with nested loops and loop control'
      ],
      content: `Loops allow you to execute a block of code repeatedly. C provides three types of loops:

• for loop: Best when you know the number of iterations
• while loop: Best when condition is checked before execution
• do-while loop: Executes at least once, condition checked after

Loop control statements like break and continue help control loop execution.`,
      codeExample: `#include <stdio.h>

int main() {
    // For loop example
    printf("For loop (1 to 5):\\n");
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\\n\\n");
    
    // While loop example
    printf("While loop (countdown):\\n");
    int count = 5;
    while (count > 0) {
        printf("%d ", count);
        count--;
    }
    printf("\\n\\n");
    
    // Do-while loop example
    printf("Do-while loop:\\n");
    int num = 1;
    do {
        printf("%d ", num);
        num++;
    } while (num <= 3);
    printf("\\n");
    
    return 0;
}`
    },
    'switch': {
      title: 'Switch Statements',
      description: 'Learn to use switch statements for multi-way decision making',
      objectives: [
        'Understand switch statement syntax',
        'Learn about break and default cases',
        'Compare switch vs if-else chains'
      ],
      content: `The switch statement provides an efficient way to handle multiple conditions based on the value of a single variable. It's particularly useful when you have many possible values to check.

Key components of switch statement:
• switch expression: The variable to be tested
• case labels: Possible values of the expression
• break statement: Prevents fall-through to next case
• default case: Executes when no case matches`,
      codeExample: `#include <stdio.h>

int main() {
    char operator = '+';
    float num1 = 10.5, num2 = 4.2, result;
    
    switch (operator) {
        case '+':
            result = num1 + num2;
            printf("%.2f + %.2f = %.2f\\n", num1, num2, result);
            break;
        case '-':
            result = num1 - num2;
            printf("%.2f - %.2f = %.2f\\n", num1, num2, result);
            break;
        case '*':
            result = num1 * num2;
            printf("%.2f * %.2f = %.2f\\n", num1, num2, result);
            break;
        case '/':
            if (num2 != 0) {
                result = num1 / num2;
                printf("%.2f / %.2f = %.2f\\n", num1, num2, result);
            } else {
                printf("Error: Division by zero!\\n");
            }
            break;
        default:
            printf("Error: Invalid operator!\\n");
    }
    
    return 0;
}`
    }
    // Add more lesson content...
  };

  const currentLessonContent = lessonContent[selectedLesson] || lessonContent['intro-c'];

  useEffect(() => {
    // In a real app, this would fetch course data from Firestore
    console.log('Loading course data for:', courseId);
    // TODO: Fetch course modules, lessons, and content from Firestore
  }, [courseId]);

  const toggleModule = (moduleId) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
  };

  const selectLesson = (lessonId) => {
    setSelectedLesson(lessonId);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="tutorials-container">
      {/* Fixed Header */}
      <header className="tutorials-header">
        <div className="header-left">
          <button 
            className="menu-toggle-btn"
            onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
            aria-label="Toggle course syllabus"
          >
            <Menu size={20} />
          </button>
          <h1 className="brand-name">GradeUpNow</h1>
        </div>
        <div className="header-center">
          <div className="breadcrumb">
            <span>{courseData.title}</span>
            <ChevronRight size={16} />
            <span>{courseData.currentModule}</span>
            <ChevronRight size={16} />
            <span>{courseData.currentLesson}</span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="search-btn"
            aria-label="Search tutorials"
          >
            🔍
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="tutorials-layout">
        {/* Left Sidebar - Course Syllabus */}
        <aside 
          className={`left-sidebar ${leftSidebarExpanded ? 'expanded' : 'collapsed'}`}
        >
          <div className="sidebar-header">
            {leftSidebarExpanded ? (
              <div className="syllabus-header">
                <span>Course Syllabus</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {leftSidebarExpanded && (
            <div className="sidebar-content">
              {/* Modules */}
              <div className="modules-section">
                {courseData.modules.map((module) => (
                  <div key={module.id} className="module">
                    <button
                      className="module-header"
                      onClick={() => toggleModule(module.id)}
                    >
                      {selectedModule === module.id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <span>{module.title}</span>
                    </button>
                    
                    {(selectedModule === module.id || module.expanded) && (
                      <div className={`module-lessons ${(selectedModule === module.id || module.expanded) ? 'expanded' : ''}`}>
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`lesson ${selectedLesson === lesson.id ? 'active' : ''}`}
                            onClick={() => selectLesson(lesson.id)}
                          >
                            <div className="lesson-status">
                              {lesson.completed ? (
                                <CheckCircle size={16} className="completed" />
                              ) : (
                                <Circle size={16} className="pending" />
                              )}
                            </div>
                            <div className="lesson-content">
                              <span className="lesson-title">{lesson.title}</span>
                              <div className="lesson-meta">
                                <Clock size={12} />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Section - Moved to bottom */}
              <div className="progress-section">
                <h3>PROGRESS</h3>
                <div className="progress-stats">
                  <div className="progress-item">
                    <span className="progress-label">Overall</span>
                    <span className="progress-value">{courseData.progress.overall}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${courseData.progress.overall}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {courseData.progress.completed} of {courseData.progress.total} lessons completed
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-wrapper">
            {/* Lesson Header */}
            <div className="lesson-header">
              <h1>{currentLessonContent.title}</h1>
              <div className="lesson-meta">
                <span className="reading-time">
                  <Clock size={16} />
                  {courseData.modules
                    .flatMap(m => m.lessons)
                    .find(l => l.id === selectedLesson)?.duration || '15 min'} read
                </span>
                <span className="difficulty">
                  🟢 Beginner
                </span>
              </div>
              <p className="lesson-description">
                {currentLessonContent.description}
              </p>
            </div>

            {/* Learning Objectives */}
            <section className="learning-objectives">
              <h2>Learning Objectives</h2>
              <div className="objectives-list">
                {currentLessonContent.objectives.map((objective, index) => (
                  <div key={index} className="objective">
                    <CheckCircle size={16} className="objective-icon" />
                    <span>{objective}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Content Sections */}
            <section className="content-section">
              <h2>{currentLessonContent.title}</h2>
              {currentLessonContent.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              
              {/* Code Example */}
              <div className="code-example">
                <div className="code-header">
                  <span>Example: {currentLessonContent.title}</span>
                  <button onClick={() => copyMessage(currentLessonContent.codeExample)}>
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="code-block">
                  <code>{currentLessonContent.codeExample}</code>
                </pre>
              </div>
            </section>

            {/* Additional sections can be added here */}

            {/* Navigation */}
            <div className="lesson-navigation">
              <button className="nav-btn prev">
                ← Previous Lesson
              </button>
              <button className="nav-btn next">
                Next Lesson →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseTutorialViewer;
