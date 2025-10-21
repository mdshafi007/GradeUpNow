// Test script to verify academic info structure
const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const EnhancedCollegeStudent = require('./models/EnhancedCollegeStudent');

async function testAcademicInfo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gradeupnow');
    console.log('✅ Connected to MongoDB');

    // Find a sample student
    const sampleStudent = await EnhancedCollegeStudent.findOne({}).select('rollNumber name year semester department');
    
    if (sampleStudent) {
      console.log('📚 Sample Student Data:');
      console.log('Roll Number:', sampleStudent.rollNumber);
      console.log('Name:', sampleStudent.name);
      console.log('Year:', sampleStudent.year);
      console.log('Semester:', sampleStudent.semester);
      console.log('Department:', sampleStudent.department);
      
      // Test the structure we're creating in analytics
      const studentInfo = {
        name: sampleStudent.name,
        academicInfo: {
          year: sampleStudent.year,
          semester: sampleStudent.semester,
          department: sampleStudent.department
        }
      };
      
      console.log('\n📋 Analytics Structure:');
      console.log(JSON.stringify(studentInfo, null, 2));
      
      console.log('\n🔍 Academic Info Access Test:');
      console.log('Year:', studentInfo.academicInfo.year);
      console.log('Semester:', studentInfo.academicInfo.semester);
    } else {
      console.log('❌ No students found in database');
    }
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAcademicInfo();