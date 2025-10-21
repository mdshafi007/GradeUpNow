import CollegeStudent from './models/CollegeStudent.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Production approach: Skip Firebase Admin user creation for now
// Use MongoDB + Firebase client auth instead
export async function createVignanStudents() {
  try {
    console.log('Creating Vignan University students (MongoDB records)...');

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
        // Generate email and password
        const email = `${rollNumber.toLowerCase()}@vignan.edu`;
        const password = `Vignan@${rollNumber}`;

        // For production: Students will sign up on frontend with these credentials
        // Backend will store them in MongoDB when they first login
        
        // Create MongoDB record (without Firebase for now)
        const collegeStudent = new CollegeStudent({
          firebaseUid: `temp_${rollNumber}`, // Temporary, will be updated on first login
          collegeCode: collegeCode,
          rollNumber: rollNumber,
          email: email,
          name: name,
          department: department,
          year: year,
          coursesEnrolled: [],
          quizzesCompleted: 0,
          assignmentsDue: Math.floor(Math.random() * 3),
          overallGrade: ['A+', 'A', 'B+', 'B'][Math.floor(Math.random() * 4)],
          isActive: true
        });

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

        await collegeStudent.save();

        results.push({
          rollNumber,
          name,
          email,
          password,
          status: 'success'
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
    
    const successfulStudents = results.filter(r => r.status === 'success' || r.status === 'exists');
    
    successfulStudents.forEach(result => {
      console.log(`Student: ${result.name}`);
      console.log(`Roll Number: ${result.rollNumber}`);
      console.log(`Email: ${result.email}`);
      console.log(`Password: ${result.password}`);
      console.log(`Status: ${result.status}`);
      console.log('---');
    });

    console.log('\n📝 INSTRUCTIONS FOR STUDENTS:');
    console.log('1. Go to college portal: http://localhost:5173/college-portal');
    console.log('2. Use Roll Number (e.g., 221FA04272) in the login field');  
    console.log('3. Use Password (e.g., Vignan@221FA04272)');
    console.log('4. System will create Firebase account on first login');

    console.log(`\nTotal: ${results.length} students`);
    console.log(`Success: ${results.filter(r => r.status === 'success').length}`);
    console.log(`Already Exists: ${results.filter(r => r.status === 'exists').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);

    return results;

  } catch (error) {
    console.error('Error in createVignanStudents:', error);
    throw error;
  }
}

// Run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { initializeFirebaseAdmin } = await import('./config/firebase.js');
  const { default: connectDB } = await import('./config/database.js');
  
  // Initialize connections
  await connectDB();
  initializeFirebaseAdmin();
  
  createVignanStudents()
    .then(() => {
      console.log('\n🎉 Vignan University students created successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Creation failed:', error);
      process.exit(1);
    });
}