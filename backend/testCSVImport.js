import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import CollegeStudent from './models/CollegeStudent.js';

dotenv.config();

async function testCSVImport() {
  try {
    console.log('🚀 Testing CSV Import...');
    
    // Connect to MongoDB with timeout
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('✅ Connected to MongoDB');

    const csvFilePath = './sample-data/mit-students.csv';
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    console.log('✅ CSV file found');

    const students = [];
    let rowCount = 0;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('CSV reading timeout after 10 seconds'));
      }, 10000);

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          students.push({
            rollNumber: row.rollNumber,
            name: row.name,
            department: row.department,
            year: row.year
          });
          console.log(`📝 Read row ${rowCount}: ${row.rollNumber} - ${row.name}`);
        })
        .on('end', async () => {
          clearTimeout(timeout);
          console.log(`✅ CSV reading complete. Found ${students.length} students`);
          
          // Just validate first 3 students for testing
          const testStudents = students.slice(0, 3);
          
          for (const student of testStudents) {
            console.log(`🔍 Validating: ${student.rollNumber} - ${student.name}`);
            
            // Check if student already exists
            const existing = await CollegeStudent.findOne({
              collegeCode: 'mit',
              rollNumber: student.rollNumber
            });
            
            if (existing) {
              console.log(`⚠️  Already exists: ${student.rollNumber}`);
            } else {
              console.log(`✅ New student: ${student.rollNumber}`);
            }
          }
          
          await mongoose.connection.close();
          console.log('✅ Database connection closed');
          
          resolve({
            totalStudents: students.length,
            testedStudents: testStudents.length,
            success: true
          });
        })
        .on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    throw error;
  }
}

// Run test with timeout
console.log('🧪 Starting CSV Import Test...');
testCSVImport()
  .then((result) => {
    console.log('\n🎉 Test Results:');
    console.log(`   Total Students in CSV: ${result.totalStudents}`);
    console.log(`   Tested Students: ${result.testedStudents}`);
    console.log('   Status: SUCCESS');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  });

// Force exit after 30 seconds to prevent hanging
setTimeout(() => {
  console.error('\n⏰ Force exit after 30 seconds timeout');
  process.exit(1);
}, 30000);