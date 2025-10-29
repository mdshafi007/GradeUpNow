

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Student = require('../src/lms/models/Student');

// Configuration
const CSV_FILE_PATH = path.join(__dirname, 'students.csv');

// csv format:: registrationNumber,name,email,college,branch,section,year,semester


async function createStudentsFromCSV() {
  const students = [];
  const results = {
    total: 0,
    created: 0,
    failed: 0,
    errors: []
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`CSV file not found: ${CSV_FILE_PATH}\n`);
      console.log('Format: registrationNumber,name,email,college,branch,section,year,semester\n');
      
      // Create empty sample CSV file with just headers
      const sampleCSV = `registrationNumber,name,email,college,branch,section,year,semester`;
      fs.writeFileSync(CSV_FILE_PATH, sampleCSV);
      console.log('Sample CSV created. Add students and run again.\n');
      process.exit(0);
    }

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          students.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    results.total = students.length;

    if (students.length === 0) {
      console.log('No students in CSV file\n');
      process.exit(0);
    }

    console.log(`Creating ${students.length} students...\n`);

    // Process each student
    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.registrationNumber || !studentData.name || !studentData.email) {
          throw new Error('Missing required fields (registrationNumber, name, or email)');
        }

        // Generate password: College@RegistrationNumber (e.g., Vignan@221FA04272)
        const password = `${studentData.college}@${studentData.registrationNumber}`;

        // Check if student already exists
        const existing = await Student.findOne({
          $or: [
            { email: studentData.email.toLowerCase() },
            { registrationNumber: studentData.registrationNumber }
          ]
        });

        if (existing) {
          console.log(`Skipped: ${studentData.registrationNumber} - Already exists`);
          results.failed++;
          results.errors.push(`${studentData.registrationNumber}: Already exists`);
          continue;
        }

        // Create student
        const student = new Student({
          email: studentData.email.toLowerCase(),
          password: password,
          registrationNumber: studentData.registrationNumber,
          name: studentData.name,
          college: studentData.college || 'Vignan',
          branch: studentData.branch || 'CSE',
          section: (studentData.section || 'A').toUpperCase(),
          year: studentData.year || '4',
          semester: studentData.semester || '2'
        });

        await student.save();

        console.log(`✓ ${studentData.registrationNumber} - ${studentData.name} (${password})`);
        results.created++;

      } catch (error) {
        console.log(`✗ ${studentData.registrationNumber} - ${error.message}`);
        results.failed++;
        results.errors.push(`${studentData.registrationNumber}: ${error.message}`);
      }
    }

    // Summary
    console.log(`\nCreated: ${results.created} | Failed: ${results.failed} | Total: ${results.total}\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createStudentsFromCSV();
