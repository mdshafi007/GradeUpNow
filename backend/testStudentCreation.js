import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CollegeStudent from './models/CollegeStudent.js';

dotenv.config();

async function createVignanStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const vignanStudents = [
      {
        rollNumber: '221FA04272',
        name: 'Shafi',
        department: 'Computer Science',
        year: '2024',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04235',
        name: 'Gowtham',
        department: 'Computer Science',
        year: '2024',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04247',
        name: 'Saketh',
        department: 'Computer Science',
        year: '2024',
        collegeCode: 'vignan'
      },
      {
        rollNumber: '221FA04256',
        name: 'Moksha',
        department: 'Computer Science',
        year: '2024',
        collegeCode: 'vignan'
      }
    ];

    const results = [];
    
    for (const studentData of vignanStudents) {
      const { rollNumber, name, department, year, collegeCode } = studentData;
      
      try {
        // Generate credentials
        const email = `${rollNumber.toLowerCase()}@vignan.edu`;
        const password = `Vignan@${rollNumber}`;

        // Check if student already exists
        const existingStudent = await CollegeStudent.findByCollegeAndRoll(collegeCode, rollNumber);
        
        if (existingStudent) {
          console.log(`⚠️ Student ${rollNumber} already exists, skipping...`);
          results.push({
            rollNumber,
            name,
            email,
            password,
            status: 'exists'
          });
          continue;
        }

        // Create MongoDB record
        const collegeStudent = new CollegeStudent({
          firebaseUid: `temp_${rollNumber}`, // Will be updated on first login
          collegeCode: collegeCode,
          rollNumber: rollNumber,
          email: email,
          name: name,
          department: department,
          year: year,
          coursesEnrolled: [],
          quizzesCompleted: 0,
          assignmentsDue: Math.floor(Math.random() * 3) + 1,
          overallGrade: ['A+', 'A', 'B+', 'B'][Math.floor(Math.random() * 4)],
          isActive: true
        });

        await collegeStudent.save();

        results.push({
          rollNumber,
          name,
          email,
          password,
          status: 'created'
        });

        console.log(`✅ Created: ${name} (${rollNumber})`);

      } catch (error) {
        console.error(`❌ Error creating ${rollNumber}:`, error.message);
        results.push({
          rollNumber,
          name,
          error: error.message,
          status: 'failed'
        });
      }
    }

    console.log('\n=== VIGNAN UNIVERSITY STUDENTS ===');
    console.log('College Code: vignan');
    console.log('Domain: vignan.edu\n');
    
    const successfulStudents = results.filter(r => r.status === 'created' || r.status === 'exists');
    
    successfulStudents.forEach(result => {
      console.log(`Student: ${result.name}`);
      console.log(`Roll Number: ${result.rollNumber}`);
      console.log(`Email: ${result.email}`);
      console.log(`Password: ${result.password}`);
      console.log(`Status: ${result.status}`);
      console.log('---');
    });

    console.log('\n📋 HOW TO LOGIN:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Go to: http://localhost:5173');
    console.log('3. Click "🎓 Switch to College" in footer');
    console.log('4. Use Roll Number as username (e.g., 221FA04272)');
    console.log('5. Use Password (e.g., Vignan@221FA04272)');
    console.log('\n🔥 Ready for testing!');

    console.log(`\nSummary: ${results.length} students processed`);
    console.log(`Created: ${results.filter(r => r.status === 'created').length}`);
    console.log(`Already Exists: ${results.filter(r => r.status === 'exists').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);

    return results;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the function
createVignanStudents().then(() => {
  console.log('✅ Student creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});