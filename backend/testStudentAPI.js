// Test script to verify student quiz API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

// Test data - update with actual student credentials
const testStudent = {
  rollNumber: '21A91A0501', // Replace with actual roll number
  collegeCode: 'vignan'
};

async function testStudentQuizAPI() {
  try {
    console.log('🧪 Testing Student Quiz API...');
    console.log('Student:', testStudent);

    // Test getting quizzes
    const response = await fetch(`${API_URL}/api/student/quizzes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'rollNumber': testStudent.rollNumber,
        'collegeCode': testStudent.collegeCode
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Response Success:');
      console.log('Status:', response.status);
      console.log('Message:', data.message);
      console.log('Quizzes found:', data.data?.quizzes?.length || 0);
      
      if (data.data?.quizzes?.length > 0) {
        console.log('\n📚 Available Quizzes:');
        data.data.quizzes.forEach((quiz, index) => {
          console.log(`${index + 1}. ${quiz.title} (${quiz.subject})`);
          console.log(`   Duration: ${quiz.durationType === 'fixed' ? quiz.fixedDuration + ' mins' : 'Window'}`);
          console.log(`   Questions: ${quiz.totalQuestions}, Marks: ${quiz.totalMarks}`);
          console.log(`   Status: ${quiz.hasAttempted ? 'Attempted' : 'Not Attempted'}`);
          console.log('');
        });
      }
      
      console.log('\n👨‍🎓 Student Info:');
      console.log('Name:', data.data?.student?.name);
      console.log('College:', data.data?.student?.collegeCode);
      console.log('Department:', data.data?.student?.department);
      console.log('Year:', data.data?.student?.year);
      
    } else {
      console.log('❌ API Response Failed:');
      console.log('Status:', response.status);
      console.log('Message:', data.message);
      console.log('Full response:', data);
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
}

// Run the test
testStudentQuizAPI();