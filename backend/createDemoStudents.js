import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from './config/firebase.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Demo function to create test college students
export async function createDemoCollegeStudents() {
  try {
    console.log('Creating demo college students...');

    // Demo students for different colleges
    const demoStudents = [
      // Demo College Students
      {
        email: '21cs001@demo.edu',
        password: 'demo21CS001123',
        displayName: 'John Doe',
        customClaims: {
          role: 'college-student',
          collegeCode: 'demo',
          rollNumber: '21CS001',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      {
        email: '21cs002@demo.edu',
        password: 'demo21CS002123',
        displayName: 'Jane Smith',
        customClaims: {
          role: 'college-student',
          collegeCode: 'demo',
          rollNumber: '21CS002',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      // Vignan University Students
      {
        email: '221fa04272@vignan.edu',
        password: 'vignan221FA04272123',
        displayName: 'Shafi',
        customClaims: {
          role: 'college-student',
          collegeCode: 'vignan',
          rollNumber: '221FA04272',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      {
        email: '221fa04235@vignan.edu',
        password: 'vignan221FA04235123',
        displayName: 'Gowtham',
        customClaims: {
          role: 'college-student',
          collegeCode: 'vignan',
          rollNumber: '221FA04235',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      {
        email: '221fa04247@vignan.edu',
        password: 'vignan221FA04247123',
        displayName: 'Saketh',
        customClaims: {
          role: 'college-student',
          collegeCode: 'vignan',
          rollNumber: '221FA04247',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      {
        email: '221fa04256@vignan.edu',
        password: 'vignan221FA04256123',
        displayName: 'Moksha',
        customClaims: {
          role: 'college-student',
          collegeCode: 'vignan',
          rollNumber: '221FA04256',
          department: 'Computer Science',
          year: '2024',
          isCollegeStudent: true
        }
      },
      // MIT Students
      {
        email: '21mit001@mit.edu',
        password: 'mit21MIT001123',
        displayName: 'Alice Johnson',
        customClaims: {
          role: 'college-student',
          collegeCode: 'mit',
          rollNumber: '21MIT001',
          department: 'Computer Science',
          year: '2023',
          isCollegeStudent: true
        }
      },
      // Stanford Students
      {
        email: '21stan001@stanford.edu',
        password: 'stanford21STAN001123',
        displayName: 'Bob Wilson',
        customClaims: {
          role: 'college-student',
          collegeCode: 'stanford',
          rollNumber: '21STAN001',
          department: 'Computer Science',
          year: '2023',
          isCollegeStudent: true
        }
      }
    ];

    const results = [];

    for (const student of demoStudents) {
      try {
        // Check if user already exists
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(student.email);
          console.log(`User ${student.email} already exists, updating...`);
          
          // Update existing user
          await admin.auth().updateUser(userRecord.uid, {
            password: student.password,
            displayName: student.displayName
          });
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create new user
            userRecord = await admin.auth().createUser({
              email: student.email,
              password: student.password,
              displayName: student.displayName,
              emailVerified: true
            });
            console.log(`Created user: ${student.email}`);
          } else {
            throw error;
          }
        }

        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, student.customClaims);

        results.push({
          email: student.email,
          rollNumber: student.customClaims.rollNumber,
          collegeCode: student.customClaims.collegeCode,
          password: student.password,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error creating/updating student ${student.email}:`, error);
        results.push({
          email: student.email,
          rollNumber: student.customClaims?.rollNumber,
          error: error.message,
          status: 'failed'
        });
      }
    }

    console.log('\nDemo Students Created/Updated:');
    console.log('================================');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ ${result.collegeCode.toUpperCase()}: ${result.rollNumber}`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Password: ${result.password}`);
        console.log(`   Login: Use roll number "${result.rollNumber}" with password above`);
        console.log('');
      } else {
        console.log(`❌ Failed: ${result.email} - ${result.error}`);
      }
    });

    return results;

  } catch (error) {
    console.error('Error in createDemoCollegeStudents:', error);
    throw error;
  }
}

// Export for manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting demo students creation...');
  createDemoCollegeStudents()
    .then((results) => {
      console.log('\nDemo students setup complete!');
      console.log(`Successfully created/updated ${results.filter(r => r.status === 'success').length} students`);
      if (results.filter(r => r.status === 'failed').length > 0) {
        console.log(`Failed: ${results.filter(r => r.status === 'failed').length} students`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

// Direct execution for testing
console.log('Starting demo students creation...');
createDemoCollegeStudents()
  .then((results) => {
    console.log('\nDemo students setup complete!');
    console.log(`Successfully created/updated ${results.filter(r => r.status === 'success').length} students`);
    if (results.filter(r => r.status === 'failed').length > 0) {
      console.log(`Failed: ${results.filter(r => r.status === 'failed').length} students`);
    }
  })
  .catch((error) => {
    console.error('Setup failed:', error);
  });