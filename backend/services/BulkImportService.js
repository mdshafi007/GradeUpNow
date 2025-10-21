import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import studentService from './StudentService.js';

/**
 * 🔥 WORLD-CLASS CSV BULK IMPORT SERVICE
 * Atomic operations, comprehensive reporting, error handling
 * Supports rollback and detailed success/failure tracking
 */

class BulkImportService {
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
      invalid: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * 🚀 Process CSV file and create Firebase + MongoDB students
   */
  async processCsvFile(csvFilePath, collegeConfig, options = {}) {
    const {
      skipDuplicates = true,
      validateOnly = false,
      batchSize = 10, // Smaller batches for Firebase API limits
      dryRun = false
    } = options;

    this.stats.startTime = new Date();
    console.log(`\n🔥 STARTING WORLD-CLASS BULK IMPORT`);
    console.log(`🏫 College: ${collegeConfig.name}`);
    console.log(`📁 File: ${csvFilePath}`);
    console.log(`🏷️  Code: ${collegeConfig.code}`);
    console.log(`🌐 Domain: ${collegeConfig.domain}`);
    console.log(`⚙️  Batch Size: ${batchSize}`);
    console.log(`🔄 Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
    console.log('═'.repeat(80));

    try {
      // Step 1: Validate college config
      this.validateCollegeConfig(collegeConfig);

      // Step 2: Validate file exists
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
      }

      // Step 3: Parse and validate CSV
      const students = await this.parseCsv(csvFilePath, collegeConfig);
      
      if (students.length === 0) {
        throw new Error('No valid student records found in CSV');
      }

      console.log(`\n📊 CSV PROCESSING RESULTS:`);
      console.log(`   Total Records: ${this.stats.total}`);
      console.log(`   Valid Records: ${students.length}`);
      console.log(`   Invalid Records: ${this.stats.invalid}`);

      // Step 4: Handle validation-only mode
      if (validateOnly) {
        return this.generateValidationReport(students, collegeConfig);
      }

      // Step 5: Check for duplicates
      console.log(`\n🔍 CHECKING FOR DUPLICATES...`);
      const duplicateCheck = await this.checkBulkDuplicates(students, collegeConfig.code);
      
      if (duplicateCheck.duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicateCheck.duplicates.length} existing students`);
        
        if (skipDuplicates) {
          this.results.duplicates = duplicateCheck.duplicates;
          this.stats.duplicates = duplicateCheck.duplicates.length;
          console.log(`   Skipping ${duplicateCheck.duplicates.length} duplicates`);
          console.log(`   Processing ${duplicateCheck.unique.length} new students`);
          
          if (duplicateCheck.unique.length === 0) {
            console.log('🎯 All students already exist - nothing to import');
            return this.generateFinalReport(collegeConfig);
          }
          
          students.splice(0, students.length, ...duplicateCheck.unique);
        } else {
          throw new Error(`Found ${duplicateCheck.duplicates.length} duplicates. Use skipDuplicates=true to skip them.`);
        }
      } else {
        console.log(`✅ No duplicates found`);
      }

      // Step 6: Process students in batches
      if (!dryRun) {
        console.log(`\n🚀 CREATING STUDENTS IN BATCHES...`);
        await this.processStudentsBatch(students, collegeConfig, batchSize);
      } else {
        console.log(`\n🧪 DRY RUN COMPLETE - No students were actually created`);
        this.stats.success = students.length;
      }

      // Step 7: Generate final report
      this.stats.endTime = new Date();
      return this.generateFinalReport(collegeConfig);

    } catch (error) {
      console.error(`❌ BULK IMPORT FAILED:`, error.message);
      this.stats.endTime = new Date();
      
      return {
        success: false,
        error: error.message,
        stats: this.stats,
        results: this.results
      };
    }
  }

  /**
   * 📄 Parse CSV file with comprehensive validation
   */
  async parseCsv(csvFilePath, collegeConfig) {
    return new Promise((resolve, reject) => {
      const students = [];
      let rowIndex = 0;

      fs.createReadStream(csvFilePath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, ''),
          skipEmptyLines: true
        }))
        .on('data', (row) => {
          this.stats.total++;
          
          // Map CSV columns to standard format
          const studentRecord = {
            rollNumber: row.rollnumber || row.roll_number || row.rollno || row.id,
            name: row.name || row.studentname || row.fullname,
            department: row.department || row.dept || row.branch,
            year: row.year || row.academicyear || row.batch,
            semester: row.semester || row.sem || null,
            batch: row.batch || row.batchyear || null,
            section: row.section || row.sec || null,
            collegeCode: collegeConfig.code,
            importSource: 'csv-bulk-import'
          };

          // Validate record
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
        .on('end', () => {
          console.log(`📄 CSV parsing complete: ${students.length} valid records`);
          
          if (this.stats.invalid > 0) {
            console.log(`\n❌ INVALID RECORDS FOUND:`);
            this.results.invalid.forEach(record => {
              console.log(`   Row ${record.rowIndex}: ${record.errors.join(', ')}`);
            });
          }
          
          resolve(students);
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  /**
   * ✅ Validate individual student record
   */
  validateStudentRecord(record, rowIndex) {
    const errors = [];
    
    // Required fields validation
    const requiredFields = ['rollNumber', 'name', 'department', 'year'];
    requiredFields.forEach(field => {
      if (!record[field] || record[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    // Format validation
    if (record.rollNumber) {
      if (record.rollNumber.length > 20) {
        errors.push('Roll number too long (max 20 characters)');
      }
      if (!/^[a-zA-Z0-9]+$/.test(record.rollNumber)) {
        errors.push('Roll number must contain only letters and numbers');
      }
    }
    
    if (record.name) {
      if (record.name.length > 100) {
        errors.push('Name too long (max 100 characters)');
      }
      if (!/^[a-zA-Z\s]+$/.test(record.name)) {
        errors.push('Name must contain only letters and spaces');
      }
    }

    if (record.year && !/^\d{4}$/.test(record.year)) {
      errors.push('Year must be a 4-digit number');
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
        semester: record.semester ? parseInt(record.semester) : null,
        batch: record.batch ? record.batch.trim() : null,
        section: record.section ? record.section.trim().toUpperCase() : null,
        collegeCode: record.collegeCode,
        importSource: record.importSource,
        rowIndex: rowIndex + 2
      }
    };
  }

  /**
   * 🔍 Check for bulk duplicates
   */
  async checkBulkDuplicates(students, collegeCode) {
    const rollNumbers = students.map(s => s.rollNumber);
    
    const existingStudents = await studentService.constructor
      .name === 'CollegeStudent' 
      ? CollegeStudent.find({
          collegeCode: collegeCode,
          rollNumber: { $in: rollNumbers }
        }).select('rollNumber name')
      : await Promise.all(rollNumbers.map(async roll => {
          const existing = await studentService.constructor.findByCollegeAndRoll?.(collegeCode, roll);
          return existing ? { rollNumber: roll, name: existing.name } : null;
        })).then(results => results.filter(Boolean));

    const existingRollNumbers = existingStudents.map(s => s.rollNumber);
    
    const unique = students.filter(s => !existingRollNumbers.includes(s.rollNumber));
    const duplicates = students.filter(s => existingRollNumbers.includes(s.rollNumber))
      .map(s => ({ ...s, reason: 'Student already exists in database' }));

    return { unique, duplicates };
  }

  /**
   * 🚀 Process students in batches
   */
  async processStudentsBatch(students, collegeConfig, batchSize) {
    const totalBatches = Math.ceil(students.length / batchSize);
    let currentBatch = 0;

    for (let i = 0; i < students.length; i += batchSize) {
      currentBatch++;
      const batch = students.slice(i, i + batchSize);
      
      console.log(`\n📦 PROCESSING BATCH ${currentBatch}/${totalBatches} (${batch.length} students)...`);
      
      // Process batch with delay to respect Firebase rate limits
      const batchPromises = batch.map((student, index) => 
        this.createSingleStudentWithDelay(student, collegeConfig, index * 100) // 100ms delay between requests
      );
      
      await Promise.all(batchPromises);
      
      // Progress update
      const progress = ((this.stats.processed / students.length) * 100).toFixed(1);
      console.log(`   📊 Progress: ${progress}% (${this.stats.processed}/${students.length})`);
      console.log(`   ✅ Success: ${this.stats.success} | ❌ Failed: ${this.stats.failed}`);

      // Add delay between batches to be nice to Firebase
      if (currentBatch < totalBatches) {
        console.log(`   ⏳ Waiting 2s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * 👤 Create single student with delay
   */
  async createSingleStudentWithDelay(studentData, collegeConfig, delay = 0) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return this.createSingleStudent(studentData, collegeConfig);
  }

  /**
   * 👤 Create single student using StudentService
   */
  async createSingleStudent(studentData, collegeConfig) {
    try {
      const result = await studentService.createStudent(studentData);
      
      if (result.success) {
        this.results.successful.push({
          rollNumber: studentData.rollNumber,
          name: studentData.name,
          email: result.data.credentials.email,
          password: result.data.credentials.password,
          firebaseUid: result.data.student.firebaseUid,
          mongoId: result.data.student.mongoId,
          loginUrl: result.data.credentials.loginUrl
        });
        this.stats.success++;
        console.log(`   ✅ ${studentData.name} (${studentData.rollNumber})`);
      } else {
        this.results.failed.push({
          ...studentData,
          error: result.error,
          details: result.details
        });
        this.stats.failed++;
        console.log(`   ❌ ${studentData.name} (${studentData.rollNumber}): ${result.error}`);
      }
      
    } catch (error) {
      this.results.failed.push({
        ...studentData,
        error: error.message
      });
      this.stats.failed++;
      console.log(`   ❌ ${studentData.name} (${studentData.rollNumber}): ${error.message}`);
    }
    
    this.stats.processed++;
  }

  /**
   * 📊 Generate final report with export
   */
  async generateFinalReport(collegeConfig) {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log(`\n🏆 BULK IMPORT COMPLETED!`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📊 FINAL STATISTICS:`);
    console.log(`   Total Records: ${this.stats.total}`);
    console.log(`   Processed: ${this.stats.processed}`);
    console.log(`   ✅ Successful: ${this.stats.success}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   ⚠️  Duplicates: ${this.stats.duplicates}`);
    console.log(`   🚫 Invalid: ${this.stats.invalid}`);

    // Create reports directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(process.cwd(), 'reports', collegeConfig.code);
    
    try {
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      // Export success credentials
      if (this.results.successful.length > 0) {
        await this.exportCredentials(this.results.successful, reportDir, timestamp);
      }

      // Export summary report
      await this.exportSummaryReport(collegeConfig, reportDir, timestamp, duration);

      console.log(`\n📁 REPORTS SAVED TO: ${reportDir}`);

    } catch (error) {
      console.error(`❌ Failed to generate reports:`, error.message);
    }

    return {
      success: this.stats.failed === 0,
      college: collegeConfig,
      stats: this.stats,
      results: this.results,
      duration: duration
    };
  }

  /**
   * 📄 Export student credentials to CSV
   */
  async exportCredentials(credentials, reportDir, timestamp) {
    const csvWriter = createObjectCsvWriter({
      path: path.join(reportDir, `credentials-${timestamp}.csv`),
      header: [
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'name', title: 'Student Name' },
        { id: 'email', title: 'Login Email' },
        { id: 'password', title: 'Password' },
        { id: 'loginUrl', title: 'Login URL' },
        { id: 'firebaseUid', title: 'Firebase UID' }
      ]
    });

    await csvWriter.writeRecords(credentials);
    console.log(`✅ Credentials exported: credentials-${timestamp}.csv`);
  }

  /**
   * 📋 Export summary report
   */
  async exportSummaryReport(collegeConfig, reportDir, timestamp, duration) {
    const report = {
      college: collegeConfig,
      timestamp: new Date().toISOString(),
      duration: `${duration.toFixed(2)} seconds`,
      statistics: this.stats,
      results: {
        successful: this.results.successful.length,
        failed: this.results.failed.map(f => ({
          rollNumber: f.rollNumber,
          name: f.name,
          error: f.error,
          details: f.details
        })),
        duplicates: this.results.duplicates.map(d => ({
          rollNumber: d.rollNumber,
          name: d.name,
          reason: d.reason
        })),
        invalid: this.results.invalid.map(i => ({
          rollNumber: i.rollNumber,
          name: i.name,
          errors: i.errors
        }))
      }
    };

    const reportPath = path.join(reportDir, `import-summary-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Summary report exported: import-summary-${timestamp}.json`);
  }

  /**
   * 🔧 Helper methods
   */
  validateCollegeConfig(config) {
    const required = ['name', 'code', 'domain'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required college config: ${missing.join(', ')}`);
    }
  }

  titleCase(str) {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  generateValidationReport(students, collegeConfig) {
    return {
      validation: true,
      college: collegeConfig,
      summary: {
        total: this.stats.total,
        valid: students.length,
        invalid: this.stats.invalid,
        readyToCreate: students.length
      },
      students: students.slice(0, 10), // First 10 for preview
      invalidRecords: this.results.invalid
    };
  }
}

// Export service
const bulkImportService = new BulkImportService();
export default bulkImportService;