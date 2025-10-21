// Quick test to create a sample quiz for Vignan college
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuizLms from './models/Quiz_lms.js';

dotenv.config();

async function createSampleQuiz() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a sample quiz for Vignan college
    const sampleQuiz = new QuizLms({
      title: "Programming Fundamentals Quiz",
      subject: "Computer Science",
      instructions: "Answer all questions carefully. Each question carries 1 point. Choose the best answer from the given options.",
      durationType: "fixed",
      fixedDuration: 30, // 30 minutes
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 1 day ago
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
      totalQuestions: 3,
      collegeName: "Vignan University",
      department: "CSE",
      createdBy: "admin_test",
      questions: [
        {
          questionText: "What is the output of printf('Hello World'); in C?",
          options: ["Hello World", "Error", "Nothing", "Hello"],
          correctAnswers: [0],
          points: 1
        },
        {
          questionText: "Which of the following is a loop structure?",
          options: ["if-else", "for", "switch", "goto"],
          correctAnswers: [1],
          points: 1
        },
        {
          questionText: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language", "None of the above"],
          correctAnswers: [0],
          points: 1
        }
      ],
      isActive: true
    });

    await sampleQuiz.save();
    console.log('✅ Sample quiz created successfully!');
    console.log('Quiz ID:', sampleQuiz._id);
    console.log('Title:', sampleQuiz.title);
    console.log('College:', sampleQuiz.collegeCode);
    console.log('Questions:', sampleQuiz.questions.length);
    
    // Check total quizzes for vignan
    const totalQuizzes = await QuizLms.countDocuments({ collegeName: 'Vignan University' });
    console.log('Total quizzes for Vignan University:', totalQuizzes);

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample quiz:', error);
    process.exit(1);
  }
}

createSampleQuiz();