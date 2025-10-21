import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CollegeStudent from './models/EnhancedCollegeStudent.js';

dotenv.config();

/**
 * 🔥 TEMPORARY STUDENT CREATION (Without Firebase User Creation)
 * Creates MongoDB profiles with temporary UIDs - users will be created on first login
 */

async function createStudentsWithPlaceholderUIDs() {
  try {
    console.log('🔥 Creating Students with Placeholder Firebase UIDs...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Your 4 students from CSV
    const students = [
      {
        rollNumber: '221FA04272',
        name: 'Shafi',
        department: 'Computer Science',
        year: '2024',
        batch: 'A',
        section: '4'
      },
      {
        rollNumber: '221FA04256', 
        name: 'Moksha',
        department: 'Computer Science',
        year: '2024',
        batch: 'A',
        section: '4'
      },
      {
        rollNumber: '221FA04235',
        name: 'Gowtham', 
        department: 'Computer Science',
        year: '2024',
        batch: 'A',
        section: '4'
      },
      {
        rollNumber: '221FA04247',
        name: 'Saketh',
        department: 'Computer Science',
        year: '2024', 
        batch: 'A',
        section: '4'
      }
    ];

    console.log(`🚀 Creating ${students.length} students...\n`);

    const results = [];

    for (const studentData of students) {
      try {
        // Generate email and temporary Firebase UID
        const email = `${studentData.rollNumber.toLowerCase()}@vignan.edu`;
        const tempFirebaseUid = `temp_${studentData.rollNumber.toLowerCase()}_${Date.now()}`;
        const password = `VIGNAN@${studentData.rollNumber}`;

        // Create MongoDB student record
        const student = new CollegeStudent({
          firebaseUid: tempFirebaseUid, // Temporary UID
          collegeCode: 'vignan',
          rollNumber: studentData.rollNumber,
          email: email,
          name: studentData.name,
          department: studentData.department,
          year: studentData.year,
          semester: parseInt(studentData.section) || null,
          batch: studentData.batch,
          section: studentData.section,
          isActive: true,
          metadata: {
            importSource: 'manual-creation',
            importedAt: new Date(),
            notes: 'Temporary Firebase UID - will be updated on first login'
          }
        });

        await student.save();

        results.push({
          rollNumber: studentData.rollNumber,
          name: studentData.name,
          email: email,
          password: password,
          mongoId: student._id,
          tempFirebaseUid: tempFirebaseUid,
          loginUrl: 'http://localhost:5173/college-portal'
        });

        console.log(`✅ ${studentData.name} (${studentData.rollNumber})`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   MongoDB ID: ${student._id}`);

      } catch (error) {
        console.log(`❌ ${studentData.name} (${studentData.rollNumber}): ${error.message}`);
      }
    }

    console.log(`\n🎉 SUCCESS! Created ${results.length} students in MongoDB`);
    console.log(`\n🔑 LOGIN CREDENTIALS:`);
    console.log(`Portal: http://localhost:5173/college-portal`);
    console.log(`\nCredentials:`);
    
    results.forEach(student => {
      console.log(`${student.name}: ${student.email} / ${student.password}`);
    });

    console.log(`\n📝 NOTE: Firebase users will be created automatically when students first login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createStudentsWithPlaceholderUIDs();