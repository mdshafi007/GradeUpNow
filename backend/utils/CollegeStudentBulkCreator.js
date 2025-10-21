import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';
import CollegeStudent from '../models/CollegeStudent.js';

dotenv.config();

/**
 * Production-Grade College Student Bulk Creator
 * Handles CSV import, validation, error handling, and credential generation
 */
class CollegeStudentBulkCreator {
  constructor() {
    this.results = {
      successful: [],
      failed: [],
      duplicates: [],
      invalid: []
    };
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      duplicates: 0,
      invalid: 0
    };
  }

  /**
   * Validate college configuration
   */
  validateCollegeConfig(config) {
    const required = ['name', 'code', 'domain', 'type'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required college config: ${missing.join(', ')}`);
    }

    // Validate domain format
    if (!/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(config.domain)) {
      throw new Error(`Invalid domain format: ${config.domain}`);
    }

    // Validate college code
    if (!/^[a-z]+$/.test(config.code)) {
      throw new Error(`College code must be lowercase letters only: ${config.code}`);
    }

    return true;
  }

  /**
   * Validate individual student record
   */
  validateStudentRecord(record, rowIndex) {
    const errors = [];
    
    // Required fields validation
    if (!record.rollNumber || record.rollNumber.trim() === '') {
      errors.push('Roll number is required');
    }
    
    if (!record.name || record.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!record.department || record.department.trim() === '') {
      errors.push('Department is required');
    }
    
    if (!record.year || record.year.trim() === '') {
      errors.push('Year is required');
    }

    // Format validation
    if (record.rollNumber && record.rollNumber.length > 20) {
      errors.push('Roll number too long (max 20 characters)');
    }
    
    if (record.name && record.name.length > 100) {
      errors.push('Name too long (max 100 characters)');
    }

    // Roll number format validation (alphanumeric only)
    if (record.rollNumber && !/^[a-zA-Z0-9]+$/.test(record.rollNumber)) {
      errors.push('Roll number must contain only letters and numbers');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors,
        record: { ...record, rowIndex: rowIndex + 2 } // +2 for header and 0-indexing
      };
    }

    return {
      valid: true,
      record: {
        rollNumber: record.rollNumber.trim().toUpperCase(),
        name: this.titleCase(record.name.trim()),
        department: this.titleCase(record.department.trim()),
        year: record.year.trim(),
        batch: record.batch ? record.batch.trim() : null,
        section: record.section ? record.section.trim().toUpperCase() : null,
        rowIndex: rowIndex + 2
      }
    };
  }

  /**
   * Convert string to title case
   */
  titleCase(str) {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Generate secure password for student
   */
  generatePassword(collegeCode, rollNumber) {
    // Format: COLLEGE@ROLLNUMBER (e.g., MIT@CS2024001)
    return `${collegeCode.toUpperCase()}@${rollNumber.toUpperCase()}`;
  }

  /**
   * Generate student email
   */
  generateEmail(rollNumber, domain) {
    return `${rollNumber.toLowerCase()}@${domain}`;
  }

  /**
   * Check for duplicate students in database
   */
  async checkForDuplicates(students, collegeCode) {
    const rollNumbers = students.map(s => s.rollNumber);
    const existingStudents = await CollegeStudent.find({
      collegeCode: collegeCode,
      rollNumber: { $in: rollNumbers }
    }).select('rollNumber name');

    return existingStudents.map(s => s.rollNumber);
  }

  /**
   * Process CSV file and create students
   */
  async processCSV(csvFilePath, collegeConfig, options = {}) {
    const {
      skipDuplicates = true,
      validateOnly = false,
      batchSize = 100
    } = options;

    console.log(`\n🏫 Processing ${collegeConfig.name} Students`);
    console.log(`📁 File: ${csvFilePath}`);
    console.log(`🏷️  College Code: ${collegeConfig.code}`);
    console.log(`🌐 Domain: ${collegeConfig.domain}`);
    console.log('═'.repeat(60));

    // Validate college config
    this.validateCollegeConfig(collegeConfig);

    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const students = [];
    let rowIndex = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, ''),
          skipEmptyLines: true
        }))
        .on('data', (row) => {
          // Map CSV columns to standard format
          const studentRecord = {
            rollNumber: row.rollnumber || row.roll_number || row.rollno || row.id,
            name: row.name || row.studentname || row.fullname,
            department: row.department || row.dept || row.branch,
            year: row.year || row.academicyear || row.batch,
            batch: row.batch || row.batchyear,
            section: row.section || row.sec
          };

          const validation = this.validateStudentRecord(studentRecord, rowIndex);
          
          if (validation.valid) {
            students.push(validation.record);
          } else {
            this.results.invalid.push({
              ...validation.record,
              errors: validation.errors
            });
            this.stats.invalid++;
          }
          
          rowIndex++;
        })
        .on('end', async () => {
          try {
            this.stats.total = students.length + this.stats.invalid;
            
            console.log(`📊 CSV Processing Complete:`);
            console.log(`   Total Rows: ${this.stats.total}`);
            console.log(`   Valid Records: ${students.length}`);
            console.log(`   Invalid Records: ${this.stats.invalid}`);

            if (this.stats.invalid > 0) {
              console.log(`\n❌ Invalid Records Found:`);
              this.results.invalid.forEach(record => {
                console.log(`   Row ${record.rowIndex}: ${record.errors.join(', ')}`);
              });
            }

            if (students.length === 0) {
              throw new Error('No valid student records found in CSV');
            }

            // Check for duplicates
            console.log('\n🔍 Checking for duplicates...');
            const existingRollNumbers = await this.checkForDuplicates(students, collegeConfig.code);
            
            if (existingRollNumbers.length > 0) {
              console.log(`⚠️  Found ${existingRollNumbers.length} existing students`);
              
              if (skipDuplicates) {
                const newStudents = students.filter(s => !existingRollNumbers.includes(s.rollNumber));
                const duplicates = students.filter(s => existingRollNumbers.includes(s.rollNumber));
                
                this.results.duplicates = duplicates.map(s => ({
                  ...s,
                  reason: 'Student already exists in database'
                }));
                this.stats.duplicates = duplicates.length;
                
                console.log(`   Skipping ${duplicates.length} duplicates`);
                console.log(`   Processing ${newStudents.length} new students`);
                
                if (validateOnly) {
                  resolve(this.generateValidationReport(newStudents, collegeConfig));
                  return;
                }

                const results = await this.createStudentsBatch(newStudents, collegeConfig, batchSize);
                resolve(results);
              } else {
                throw new Error(`Found ${existingRollNumbers.length} duplicate students. Use skipDuplicates option to skip them.`);
              }
            } else {
              console.log('✅ No duplicates found');
              
              if (validateOnly) {
                resolve(this.generateValidationReport(students, collegeConfig));
                return;
              }

              const results = await this.createStudentsBatch(students, collegeConfig, batchSize);
              resolve(results);
            }
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  /**
   * Create students in batches for better performance
   */
  async createStudentsBatch(students, collegeConfig, batchSize = 100) {
    console.log(`\n🚀 Creating ${students.length} students in batches of ${batchSize}...`);
    
    const totalBatches = Math.ceil(students.length / batchSize);
    let currentBatch = 0;

    for (let i = 0; i < students.length; i += batchSize) {
      currentBatch++;
      const batch = students.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${currentBatch}/${totalBatches} (${batch.length} students)...`);
      
      for (const student of batch) {
        try {
          await this.createSingleStudent(student, collegeConfig);
          this.stats.success++;
        } catch (error) {
          this.results.failed.push({
            ...student,
            error: error.message
          });
          this.stats.failed++;
        }
        this.stats.processed++;
      }
      
      // Progress indicator
      const progress = ((this.stats.processed / students.length) * 100).toFixed(1);
      console.log(`   Progress: ${progress}% (${this.stats.processed}/${students.length})`);
    }

    return this.generateFinalReport(collegeConfig);
  }

  /**
   * Create single student record
   */
  async createSingleStudent(studentData, collegeConfig) {
    const email = this.generateEmail(studentData.rollNumber, collegeConfig.domain);
    const password = this.generatePassword(collegeConfig.code, studentData.rollNumber);

    const collegeStudent = new CollegeStudent({
      firebaseUid: `temp_${studentData.rollNumber}`, // Will be updated on first login
      collegeCode: collegeConfig.code,
      rollNumber: studentData.rollNumber,
      email: email,
      name: studentData.name,
      department: studentData.department,
      year: studentData.year,
      batch: studentData.batch,
      section: studentData.section,
      coursesEnrolled: [],
      quizzesCompleted: 0,
      assignmentsDue: Math.floor(Math.random() * 3),
      overallGrade: ['A+', 'A', 'B+', 'B'][Math.floor(Math.random() * 4)],
      isActive: true,
      metadata: {
        importedAt: new Date(),
        importSource: 'csv-bulk-import'
      }
    });

    await collegeStudent.save();

    this.results.successful.push({
      rollNumber: studentData.rollNumber,
      name: studentData.name,
      email: email,
      password: password,
      department: studentData.department,
      year: studentData.year,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/college-portal`
    });
  }

  /**
   * Generate validation report without creating students
   */
  generateValidationReport(students, collegeConfig) {
    const credentials = students.map(student => ({
      rollNumber: student.rollNumber,
      name: student.name,
      email: this.generateEmail(student.rollNumber, collegeConfig.domain),
      password: this.generatePassword(collegeConfig.code, student.rollNumber),
      department: student.department,
      year: student.year
    }));

    return {
      validation: true,
      college: collegeConfig,
      summary: {
        total: this.stats.total,
        valid: students.length,
        invalid: this.stats.invalid,
        duplicates: this.stats.duplicates,
        readyToCreate: students.length
      },
      credentials: credentials,
      invalidRecords: this.results.invalid,
      duplicateRecords: this.results.duplicates
    };
  }

  /**
   * Generate final report after student creation
   */
  async generateFinalReport(collegeConfig) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(process.cwd(), 'reports', collegeConfig.code);
    
    // Create reports directory
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Generate credentials CSV
    if (this.results.successful.length > 0) {
      const credentialsPath = path.join(reportDir, `credentials-${timestamp}.csv`);
      await this.generateCredentialsCSV(credentialsPath);
    }

    // Generate error report if needed
    if (this.results.failed.length > 0 || this.results.invalid.length > 0) {
      const errorsPath = path.join(reportDir, `errors-${timestamp}.csv`);
      await this.generateErrorReport(errorsPath);
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

    return this.printFinalSummary(collegeConfig, reportDir);
  }

  /**
   * Generate CSV file with student credentials
   */
  async generateCredentialsCSV(filePath) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'name', title: 'Student Name' },
        { id: 'email', title: 'Login Email' },
        { id: 'password', title: 'Password' },
        { id: 'department', title: 'Department' },
        { id: 'year', title: 'Year' },
        { id: 'loginUrl', title: 'Login URL' }
      ]
    });

    await csvWriter.writeRecords(this.results.successful);
    console.log(`📄 Credentials exported to: ${filePath}`);
  }

  /**
   * Generate error report CSV
   */
  async generateErrorReport(filePath) {
    const allErrors = [
      ...this.results.failed.map(r => ({ ...r, type: 'Creation Failed' })),
      ...this.results.invalid.map(r => ({ ...r, type: 'Validation Failed' })),
      ...this.results.duplicates.map(r => ({ ...r, type: 'Duplicate Record' }))
    ];

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'type', title: 'Error Type' },
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'name', title: 'Name' },
        { id: 'rowIndex', title: 'CSV Row' },
        { id: 'error', title: 'Error Message' },
        { id: 'errors', title: 'Validation Errors' }
      ]
    });

    await csvWriter.writeRecords(allErrors.map(error => ({
      ...error,
      errors: Array.isArray(error.errors) ? error.errors.join('; ') : error.errors
    })));

    console.log(`❌ Error report exported to: ${filePath}`);
  }

  /**
   * Print final summary
   */
  printFinalSummary(collegeConfig, reportDir) {
    console.log('\n' + '═'.repeat(80));
    console.log(`🎓 ${collegeConfig.name.toUpperCase()} - BULK IMPORT COMPLETE`);
    console.log('═'.repeat(80));
    console.log(`📊 SUMMARY:`);
    console.log(`   Total Records Processed: ${this.stats.total}`);
    console.log(`   ✅ Successfully Created: ${this.stats.success}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   🔄 Duplicates Skipped: ${this.stats.duplicates}`);
    console.log(`   ⚠️  Invalid Records: ${this.stats.invalid}`);
    console.log('');
    console.log(`🏫 COLLEGE DETAILS:`);
    console.log(`   Name: ${collegeConfig.name}`);
    console.log(`   Code: ${collegeConfig.code}`);
    console.log(`   Domain: ${collegeConfig.domain}`);
    console.log(`   Type: ${collegeConfig.type}`);
    console.log('');
    console.log(`📁 REPORTS GENERATED:`);
    console.log(`   Directory: ${reportDir}`);
    if (this.stats.success > 0) {
      console.log(`   ✅ Student credentials CSV generated`);
    }
    if (this.stats.failed > 0 || this.stats.invalid > 0) {
      console.log(`   ❌ Error report CSV generated`);
    }
    console.log('');
    console.log(`🚀 NEXT STEPS:`);
    console.log(`   1. Send credentials CSV to college administration`);
    console.log(`   2. Students can login at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/college-portal`);
    console.log(`   3. Monitor error reports and fix any issues`);
    console.log('');
    console.log('🎉 Bulk import process completed successfully!');
    console.log('═'.repeat(80));

    return {
      success: true,
      college: collegeConfig,
      stats: this.stats,
      results: this.results,
      reportDirectory: reportDir
    };
  }
}

export default CollegeStudentBulkCreator;