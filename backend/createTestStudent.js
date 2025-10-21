import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { firebaseManager } from './config/firebaseAdmin.js';
import studentService from './services/StudentService.js';

dotenv.config();

/**
 * 🧪 TEST SINGLE STUDENT CREATION
 * Create one student with Firebase + MongoDB
 */

async function createTestStudent() {
  try {
    console.log('🧪 Creating Test Student...\n');

    // Initialize systems
    await firebaseManager.initialize();
    await mongoose.connect(process.env.MONGODB_URI);

    // Test student data
    const testStudent = {
      name: 'Shafi Test',
      rollNumber: '221FA04272',
      department: 'Computer Science',
      year: '2024',
      semester: 4,
      batch: 'A',
      section: '4',
      collegeCode: 'vignan',
      collegeName: 'Vignan University' // Add college name
    };

    console.log('🚀 Creating student:', testStudent.name);
    console.log('🏫 College:', testStudent.collegeCode);
    console.log('📋 Roll Number:', testStudent.rollNumber);

    // Create student
    const result = await studentService.createStudent(testStudent);

    if (result.success) {
      console.log('\n✅ SUCCESS! Student created:');
      console.log('   Firebase UID:', result.data.student.firebaseUid);
      console.log('   MongoDB ID:', result.data.student.mongoId);
      console.log('   Email:', result.data.credentials.email);
      console.log('   Password:', result.data.credentials.password);
      console.log('   Login URL:', result.data.credentials.loginUrl);
      console.log('\n🎉 Test student can now login to the college portal!');
    } else {
      console.log('\n❌ FAILED to create student:');
      console.log('   Error:', result.error);
      console.log('   Details:', result.details);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestStudent();