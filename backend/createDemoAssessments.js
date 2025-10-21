import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from './models/Assessment.js';

dotenv.config();

async function createDemoAssessment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Sample assessment for Vignan University
    const demoAssessment = new Assessment({
      title: 'Data Structures Quiz - Module 1',
      description: 'Assessment covering arrays, linked lists, and basic data structure concepts.',
      type: 'quiz',
      targetColleges: ['vignan'],
      duration: 30,
      questions: [
        {
          questionText: 'What is the time complexity of accessing an element in an array by index?',
          type: 'multiple-choice',
          options: [
            { text: 'O(1)', isCorrect: true },
            { text: 'O(n)', isCorrect: false },
            { text: 'O(log n)', isCorrect: false },
            { text: 'O(n²)', isCorrect: false }
          ],
          points: 2
        },
        {
          questionText: 'Which data structure follows LIFO (Last In First Out) principle?',
          type: 'multiple-choice',
          options: [
            { text: 'Queue', isCorrect: false },
            { text: 'Stack', isCorrect: true },
            { text: 'Array', isCorrect: false },
            { text: 'Linked List', isCorrect: false }
          ],
          points: 2
        },
        {
          questionText: 'What is the main advantage of a linked list over an array?',
          type: 'multiple-choice',
          options: [
            { text: 'Faster access time', isCorrect: false },
            { text: 'Dynamic size allocation', isCorrect: true },
            { text: 'Less memory usage', isCorrect: false },
            { text: 'Better cache performance', isCorrect: false }
          ],
          points: 3
        },
        {
          questionText: 'In which scenario would you prefer a queue over a stack?',
          type: 'multiple-choice',
          options: [
            { text: 'When you need LIFO behavior', isCorrect: false },
            { text: 'When you need FIFO behavior', isCorrect: true },
            { text: 'When you need random access', isCorrect: false },
            { text: 'When you need sorting', isCorrect: false }
          ],
          points: 3
        }
      ],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      instructions: 'This is a timed quiz on basic data structures. You have 30 minutes to complete all questions. Each question has only one correct answer.',
      allowRetakes: false,
      showResults: true,
      randomizeQuestions: false,
      passingScore: 70,
      createdBy: 'admin_demo_uid', // Demo admin UID
      isActive: true
    });

    // Check if assessment already exists
    const existingAssessment = await Assessment.findOne({
      title: 'Data Structures Quiz - Module 1',
      targetColleges: 'vignan'
    });

    if (existingAssessment) {
      console.log('⚠️ Assessment already exists, skipping...');
      console.log(`Assessment ID: ${existingAssessment._id}`);
    } else {
      await demoAssessment.save();
      console.log('✅ Demo assessment created successfully!');
      console.log(`Assessment ID: ${demoAssessment._id}`);
      console.log(`Title: ${demoAssessment.title}`);
      console.log(`Target College: ${demoAssessment.targetColleges.join(', ')}`);
      console.log(`Duration: ${demoAssessment.duration} minutes`);
      console.log(`Total Questions: ${demoAssessment.questions.length}`);
      console.log(`Total Points: ${demoAssessment.totalPoints}`);
      console.log(`Due Date: ${demoAssessment.dueDate}`);
    }

    // Create another assessment
    const codingAssessment = new Assessment({
      title: 'Basic Programming Challenge',
      description: 'Simple coding problems to test your programming fundamentals.',
      type: 'coding',
      targetColleges: ['vignan'],
      duration: 45,
      questions: [
        {
          questionText: 'Write a function to find the maximum element in an array.',
          type: 'coding',
          points: 10,
          codeTemplate: `function findMax(arr) {
    // Write your code here
    
}

// Test your function
console.log(findMax([1, 5, 3, 9, 2])); // Should output: 9`,
          testCases: [
            {
              input: '[1, 5, 3, 9, 2]',
              expectedOutput: '9',
              isHidden: false
            },
            {
              input: '[-5, -2, -10, -1]',
              expectedOutput: '-1',
              isHidden: true
            }
          ]
        }
      ],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      instructions: 'Solve the coding problems using any programming language. Make sure your code handles all test cases.',
      allowRetakes: true,
      showResults: true,
      randomizeQuestions: false,
      passingScore: 60,
      createdBy: 'admin_demo_uid',
      isActive: true
    });

    const existingCodingAssessment = await Assessment.findOne({
      title: 'Basic Programming Challenge',
      targetColleges: 'vignan'
    });

    if (existingCodingAssessment) {
      console.log('⚠️ Coding assessment already exists, skipping...');
    } else {
      await codingAssessment.save();
      console.log('✅ Demo coding assessment created successfully!');
      console.log(`Assessment ID: ${codingAssessment._id}`);
      console.log(`Title: ${codingAssessment.title}`);
    }

    console.log('\n🎯 Assessments ready for Vignan University students!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the function
createDemoAssessment().then(() => {
  console.log('✅ Demo assessments creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});