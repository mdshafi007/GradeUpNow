import dotenv from 'dotenv';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import { firebaseManager } from './config/firebaseAdmin.js';
import studentService from './services/StudentService.js';

dotenv.config();

/**
 * 🔧 HELPER FUNCTIONS - No conversion needed for B.Tech years
 */

/**
 * 🏛️ VIGNAN COLLEGE STUDENT BULK IMPORT
 * Production-ready CSV import for real Vignan student data
 * 
 * CSV Format Expected:
 * RegisterNo,Name,Year,Dept/Branch,Semester,Email,Section
 * 221FA04001,John Doe,3,Computer Science,1,john@vignan.edu,A
 */

async function importVignanStudents(csvFilePath) {
  try {
    console.log('🏛️ VIGNAN COLLEGE - BULK STUDENT IMPORT');
    console.log('=' .repeat(60));
    console.log(`📄 CSV File: ${csvFilePath}`);
    console.log(`📅 Date: ${new Date().toLocaleString()}\n`);

    // Initialize systems
    await firebaseManager.initialize();
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Firebase and MongoDB connected\n');

    // Validate file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const students = [];
    const errors = [];
    
    console.log('📖 Reading CSV file...\n');

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          // Map CSV headers to our expected format
          mapHeaders: ({ header }) => {
            const headerMap = {
              'RegisterNo': 'registerNo',
              'Name': 'name',
              'Year': 'year',
              'Dept/Branch': 'department',
              'Semester': 'semester', 
              'Email': 'email',
              'Section': 'section'
            };
            return headerMap[header] || header.toLowerCase();
          }
        }))
        .on('data', (row) => {
          try {
            // Validate and clean data
            const student = {
              rollNumber: row.registerNo?.toString().trim().toUpperCase(),
              name: row.name?.toString().trim(),
              year: row.year?.toString().trim(), // Keep as B.Tech year (1,2,3,4)
              department: row.department?.toString().trim(),
              semester: parseInt(row.semester) || 1,
              email: row.email?.toString().trim().toLowerCase(),
              section: row.section?.toString().trim().toUpperCase(),
              collegeCode: 'vignan'
            };

            // Basic validation
            if (!student.rollNumber || !student.name || !student.department) {
              errors.push({
                row: students.length + 1,
                data: row,
                error: 'Missing required fields (RegisterNo, Name, or Department)'
              });
              return;
            }

            // Year validation (B.Tech years 1-4)
            if (!['1', '2', '3', '4'].includes(student.year)) {
              errors.push({
                row: students.length + 1,
                data: row,
                error: `Invalid year: ${row.year}. Must be 1, 2, 3, or 4 (B.Tech year)`
              });
              return;
            }

            // Semester validation (1-8, but typically 1-2 per year)
            if (student.semester < 1 || student.semester > 8) {
              student.semester = 1; // Default to semester 1
              console.log(`⚠️  Row ${students.length + 1}: Invalid semester, defaulted to 1`);
            }

            students.push(student);

          } catch (error) {
            errors.push({
              row: students.length + 1,
              data: row,
              error: error.message
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log('📊 CSV Processing Complete:');
    console.log(`   Valid students found: ${students.length}`);
    console.log(`   Errors/Invalid rows: ${errors.length}\n`);

    // Show errors if any
    if (errors.length > 0) {
      console.log('⚠️  VALIDATION ERRORS:');
      errors.forEach((error, index) => {
        if (index < 5) { // Show first 5 errors only
          console.log(`   Row ${error.row}: ${error.error}`);
        }
      });
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more errors`);
      }
      console.log('');
    }

    // Ask for confirmation (in production, you might want to auto-proceed)
    console.log('🚀 Ready to create students in Firebase + MongoDB...\n');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process students one by one with progress
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      console.log(`📝 Processing ${i + 1}/${students.length}: ${student.name} (${student.rollNumber})`);
      
      try {
        console.log(`   📊 Student data being sent:`, JSON.stringify(student, null, 4));
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
        } else {
          failCount++;
          console.log(`   ❌ FAILED: ${result.error}`);
          console.log(`   🔍 Full error details:`, JSON.stringify(result, null, 2));
        }
        
      } catch (error) {
        failCount++;
        console.log(`   ❌ ERROR: ${error.message}`);
        console.log(`   🔍 Full error stack:`, error.stack);
      }

      // Small delay to avoid rate limiting
      if (i < students.length - 1 && (i + 1) % 10 === 0) {
        console.log('   ⏳ Pausing for 3 seconds to avoid rate limits...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Final Results
    console.log('\n' + '🏆'.repeat(80));
    console.log('🎉 VIGNAN COLLEGE STUDENT IMPORT COMPLETE!');
    console.log('🏆'.repeat(80));
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   📄 CSV File: ${csvFilePath}`);
    console.log(`   📋 Total Records: ${students.length + errors.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⚠️  CSV Errors: ${errors.length}`);

    if (results.length > 0) {
      console.log(`\n🎯 STUDENT LOGIN CREDENTIALS:`);
      console.log(`🌐 Portal: http://localhost:5173/college-portal\n`);
      
      // Show first 10 credentials
      const showCount = Math.min(results.length, 10);
      for (let i = 0; i < showCount; i++) {
        const student = results[i];
        console.log(`${i + 1}. ${student.name} (${student.rollNumber})`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🔐 Password: ${student.password}`);
        console.log(`   🔥 Firebase UID: ${student.firebaseUid}`);
        console.log('');
      }

      if (results.length > 10) {
        console.log(`... and ${results.length - 10} more students created successfully!`);
      }

      console.log(`\n🚀 ALL STUDENTS CAN NOW LOGIN TO THE COLLEGE PORTAL!`);
      console.log(`🌐 URL: http://localhost:5173/college-portal`);
      
      // Save credentials report
      const reportPath = `vignan_student_credentials_${Date.now()}.csv`;
      const csvContent = [
        'Name,Roll Number,Email,Password,Firebase UID,MongoDB ID',
        ...results.map(s => `${s.name},${s.rollNumber},${s.email},${s.password},${s.firebaseUid},${s.mongoId}`)
      ].join('\n');
      
      fs.writeFileSync(reportPath, csvContent);
      console.log(`\n📄 Credentials saved to: ${reportPath}`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Usage: node importVignanStudents.js path/to/vignan-students.csv
const [,, csvFilePath] = process.argv;

if (!csvFilePath) {
  console.log('❌ Usage: node importVignanStudents.js <path-to-csv-file>');
  console.log('📋 Example: node importVignanStudents.js vignan-students.csv');
  process.exit(1);
}

importVignanStudents(csvFilePath);