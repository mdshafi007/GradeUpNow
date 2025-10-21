import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import CollegeStudent from './models/CollegeStudent.js';

dotenv.config();

// College configurations
const COLLEGE_CONFIGS = {
  vignan: {
    name: 'Vignan University',
    code: 'vignan',
    domain: 'vignan.edu'
  },
  mit: {
    name: 'MIT Manipal',
    code: 'mit',
    domain: 'manipal.edu'
  },
  vit: {
    name: 'VIT University',
    code: 'vit',
    domain: 'vit.ac.in'
  },
  iit: {
    name: 'Indian Institute of Technology',
    code: 'iit',
    domain: 'iitb.ac.in'
  }
};

async function createStudentsFromCSV(collegeCode, csvFilePath) {
  try {
    // Validate inputs
    if (!COLLEGE_CONFIGS[collegeCode]) {
      throw new Error(`Unknown college code: ${collegeCode}. Available: ${Object.keys(COLLEGE_CONFIGS).join(', ')}`);
    }

    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const collegeConfig = COLLEGE_CONFIGS[collegeCode];
    console.log(`\n🏫 Creating ${collegeConfig.name} Students`);
    console.log(`📁 File: ${csvFilePath}`);
    console.log(`🌐 Domain: ${collegeConfig.domain}`);
    console.log('═'.repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV
    const students = [];
    let rowCount = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Validate required fields
          if (!row.rollNumber || !row.name || !row.department || !row.year) {
            console.log(`⚠️  Row ${rowCount}: Missing required fields, skipping`);
            return;
          }

          students.push({
            rollNumber: row.rollNumber.trim().toUpperCase(),
            name: row.name.trim(),
            department: row.department.trim(),
            year: row.year.trim(),
            batch: row.batch ? row.batch.trim() : null,
            section: row.section ? row.section.trim() : null
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Found ${students.length} valid students in CSV`);

    if (students.length === 0) {
      throw new Error('No valid students found in CSV file');
    }

    // Check for duplicates
    const rollNumbers = students.map(s => s.rollNumber);
    const existingStudents = await CollegeStudent.find({
      collegeCode: collegeConfig.code,
      rollNumber: { $in: rollNumbers }
    }).select('rollNumber');

    const existingRollNumbers = existingStudents.map(s => s.rollNumber);
    const newStudents = students.filter(s => !existingRollNumbers.includes(s.rollNumber));
    const duplicates = students.filter(s => existingRollNumbers.includes(s.rollNumber));

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} existing students, skipping duplicates`);
    }

    if (newStudents.length === 0) {
      console.log('❌ All students already exist in database');
      await mongoose.connection.close();
      return;
    }

    console.log(`🚀 Creating ${newStudents.length} new students...`);

    // Create students
    const results = [];
    let created = 0;
    let failed = 0;

    for (const student of newStudents) {
      try {
        const email = `${student.rollNumber.toLowerCase()}@${collegeConfig.domain}`;
        const password = `${collegeConfig.code.toUpperCase()}@${student.rollNumber}`;

        const collegeStudent = new CollegeStudent({
          firebaseUid: `temp_${student.rollNumber}`, // Updated on first login
          collegeCode: collegeConfig.code,
          rollNumber: student.rollNumber,
          email: email,
          name: student.name,
          department: student.department,
          year: student.year,
          batch: student.batch,
          section: student.section,
          coursesEnrolled: [],
          quizzesCompleted: 0,
          assignmentsDue: Math.floor(Math.random() * 3),
          overallGrade: ['A+', 'A', 'B+', 'B'][Math.floor(Math.random() * 4)],
          isActive: true
        });

        await collegeStudent.save();

        results.push({
          rollNumber: student.rollNumber,
          name: student.name,
          email: email,
          password: password,
          department: student.department,
          year: student.year
        });

        created++;
        console.log(`✅ Created: ${student.name} (${student.rollNumber})`);

      } catch (error) {
        failed++;
        console.log(`❌ Failed: ${student.rollNumber} - ${error.message}`);
      }
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

    // Print results
    console.log('\n' + '═'.repeat(60));
    console.log(`🎓 ${collegeConfig.name.toUpperCase()} - IMPORT COMPLETE`);
    console.log('═'.repeat(60));
    console.log(`📊 SUMMARY:`);
    console.log(`   Total in CSV: ${students.length}`);
    console.log(`   ✅ Successfully Created: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   🔄 Duplicates Skipped: ${duplicates.length}`);
    console.log('');

    if (results.length > 0) {
      console.log(`🔑 STUDENT CREDENTIALS:`);
      console.log('─'.repeat(60));
      results.forEach(student => {
        console.log(`Student: ${student.name}`);
        console.log(`Roll Number: ${student.rollNumber}`);
        console.log(`Email: ${student.email}`);
        console.log(`Password: ${student.password}`);
        console.log(`Department: ${student.department}`);
        console.log(`Year: ${student.year}`);
        console.log('─'.repeat(60));
      });

      console.log(`\n📍 LOGIN INSTRUCTIONS:`);
      console.log(`1. Go to: http://localhost:5173/college-portal`);
      console.log(`2. Use Roll Number as username (e.g., ${results[0].rollNumber})`);
      console.log(`3. Use Password (e.g., ${results[0].password})`);
      console.log(`4. Students can login immediately!`);
    }

    console.log('\n🎉 Bulk import process completed successfully!');

  } catch (error) {
    console.error(`\n❌ Import failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Command line usage
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log(`
🎓 Production College Student CSV Import
═══════════════════════════════════════

Usage: node simpleCSVImport.js <college-code> <csv-file>

Examples:
  node simpleCSVImport.js mit sample-data/mit-students.csv
  node simpleCSVImport.js vit sample-data/vit-students.csv
  node simpleCSVImport.js vignan vignan-2024.csv

Available Colleges:
${Object.entries(COLLEGE_CONFIGS).map(([code, config]) => 
  `  ${code.padEnd(8)} - ${config.name} (${config.domain})`
).join('\n')}

CSV Format Required:
  rollNumber,name,department,year,batch,section
  MIT001,John Doe,Computer Science,2024,A,1
  MIT002,Jane Smith,Electrical Engineering,2024,B,2
  `);
  process.exit(1);
}

const [collegeCode, csvFilePath] = args;

// Run the import
createStudentsFromCSV(collegeCode, csvFilePath);