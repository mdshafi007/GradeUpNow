import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EnhancedCollegeStudent from './models/EnhancedCollegeStudent.js';

dotenv.config();

/**
 * 🔍 DEBUG VALIDATION ERRORS
 * Test one student to see exact validation failure
 */

async function debugValidation() {
  try {
    console.log('🔍 DEBUGGING VALIDATION ERRORS...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Test student data (from CSV)
    const testStudent = {
      rollNumber: '221FA04272',
      name: 'Shafi',
      year: '4',
      department: 'CSE',
      semester: 1,
      email: 'shafi123@gmail.com',
      section: '4',
      collegeCode: 'vignan'
    };

    console.log('📊 Testing with student data:');
    console.log(JSON.stringify(testStudent, null, 2));
    console.log('');

    // Try to create the student and catch validation error
    try {
      const student = new EnhancedCollegeStudent(testStudent);
      await student.validate();
      console.log('✅ Validation passed!');
    } catch (validationError) {
      console.log('❌ VALIDATION FAILED:');
      console.log('Error message:', validationError.message);
      console.log('');
      
      if (validationError.errors) {
        console.log('📋 DETAILED ERRORS:');
        for (const field in validationError.errors) {
          console.log(`   - ${field}: ${validationError.errors[field].message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

debugValidation();