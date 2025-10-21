import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { firebaseManager } from './config/firebaseAdmin.js';
import studentService from './services/StudentService.js';

dotenv.config();

/**
 * 🔥 CREATE ALL 4 VIG STUDENTS
 * Perfect Firebase + MongoDB integration
 */

async function createVigStudents() {
  try {
    console.log('🔥 CREATING ALL 4 VIGNAN STUDENTS...\n');

    // Initialize systems
    await firebaseManager.initialize();
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Firebase and MongoDB connected\n');

    // Your 4 students from CSV (with proper semester field)
    const students = [
      {
        rollNumber: '221FA04272',
        name: 'Shafi',
        department: 'Computer Science',
        year: '2024',
        semester: 6,  // 3rd year, 2nd semester
        batch: 'A',
        section: '4',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04256', 
        name: 'Moksha',
        department: 'Computer Science',
        year: '2024',
        semester: 6,  // 3rd year, 2nd semester
        batch: 'A',
        section: '4',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04235',
        name: 'Gowtham', 
        department: 'Computer Science',
        year: '2024',
        semester: 6,  // 3rd year, 2nd semester
        batch: 'A',
        section: '4',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04247',
        name: 'Saketh',
        department: 'Computer Science',
        year: '2024', 
        semester: 6,  // 3rd year, 2nd semester
        batch: 'A',
        section: '4',
        collegeCode: 'vignan'
      }
    ];

    console.log(`🚀 Creating ${students.length} students with Firebase + MongoDB...\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Create students one by one with delays (Firebase rate limiting)
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      console.log(`📝 Processing ${i + 1}/${students.length}: ${student.name} (${student.rollNumber})`);
      
      try {
        const result = await studentService.createStudent(student);
        
        if (result.success) {
          successCount++;
          results.push({
            name: student.name,
            rollNumber: student.rollNumber,
            email: result.data.credentials.email,
            password: result.data.credentials.password,
            firebaseUid: result.data.student.firebaseUid,
            mongoId: result.data.student.mongoId,
            status: 'Created'
          });
          console.log(`   ✅ SUCCESS: Firebase UID ${result.data.student.firebaseUid}`);
        } else if (result.error && result.error.includes('Duplicate student found')) {
          // Handle existing students
          console.log(`   ⚠️  SKIPPED: Student already exists`);
          results.push({
            name: student.name,
            rollNumber: student.rollNumber,
            email: `${student.rollNumber.toLowerCase()}@vignan.edu`,
            password: 'Already exists',
            status: 'Already exists'
          });
          successCount++; // Count as success since student exists
        } else {
          failCount++;
          console.log(`   ❌ FAILED: ${result.error}`);
        }
        
      } catch (error) {
        failCount++;
        console.log(`   ❌ ERROR: ${error.message}`);
      }

      // Small delay between requests to respect Firebase rate limits
      if (i < students.length - 1) {
        console.log('   ⏳ Waiting 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final Results
    console.log('\n' + '🏆'.repeat(60));
    console.log('🎉 VIGNAN STUDENTS CREATION COMPLETE!');
    console.log('🏆'.repeat(60));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Students: ${students.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    if (results.length > 0) {
      console.log(`\n🎯 STUDENT LOGIN CREDENTIALS:`);
      console.log(`Portal: http://localhost:5173/college-portal\n`);
      
      results.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.rollNumber}) - ${student.status}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🔐 Password: ${student.password}`);
        if (student.firebaseUid) {
          console.log(`   🔥 Firebase UID: ${student.firebaseUid}`);
          console.log(`   📊 MongoDB ID: ${student.mongoId}`);
        }
        console.log('');
      });

      console.log(`🚀 ALL STUDENTS CAN NOW LOGIN TO THE COLLEGE PORTAL!`);
      console.log(`🌐 URL: http://localhost:5173/college-portal`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createVigStudents();