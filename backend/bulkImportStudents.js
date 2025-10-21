import CollegeStudentBulkCreator from './utils/CollegeStudentBulkCreator.js';

/**
 * Production CSV Import Script
 * Usage: node bulkImportStudents.js <college-config> <csv-file> [options]
 */

// College configurations
const COLLEGE_CONFIGS = {
  vignan: {
    name: 'Vignan University',
    code: 'vignan',
    domain: 'vignan.edu',
    type: 'university',
    location: 'Guntur, Andhra Pradesh'
  },
  mit: {
    name: 'MIT Manipal',
    code: 'mit',
    domain: 'manipal.edu',
    type: 'university',
    location: 'Manipal, Karnataka'
  },
  iit: {
    name: 'Indian Institute of Technology',
    code: 'iit',
    domain: 'iitb.ac.in',
    type: 'institute',
    location: 'Mumbai, Maharashtra'
  },
  vit: {
    name: 'VIT University',
    code: 'vit',
    domain: 'vit.ac.in',
    type: 'university',
    location: 'Vellore, Tamil Nadu'
  },
  bits: {
    name: 'BITS Pilani',
    code: 'bits',
    domain: 'pilani.bits-pilani.ac.in',
    type: 'institute',
    location: 'Pilani, Rajasthan'
  }
};

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log(`
🎓 Production College Student Bulk Import System
═══════════════════════════════════════════════

Usage: node bulkImportStudents.js <college-code> <csv-file-path> [options]

Examples:
  node bulkImportStudents.js vignan students.csv
  node bulkImportStudents.js mit mit-students.csv --validate-only
  node bulkImportStudents.js iit iit-2024.csv --skip-duplicates=false

Options:
  --validate-only      Only validate CSV without creating students
  --skip-duplicates    Skip duplicate students (default: true)
  --batch-size=N       Process in batches of N students (default: 100)

Available Colleges:
${Object.entries(COLLEGE_CONFIGS).map(([code, config]) => 
  `  ${code.padEnd(10)} - ${config.name} (${config.domain})`
).join('\n')}

CSV Format Required:
  rollNumber,name,department,year,batch,section
  CS2024001,John Doe,Computer Science,2024,A,1
  EE2024002,Jane Smith,Electrical Engineering,2024,B,2
      `);
      process.exit(1);
    }

    const [collegeCode, csvFilePath] = args;
    const options = {};

    // Parse command line options
    args.slice(2).forEach(arg => {
      if (arg === '--validate-only') {
        options.validateOnly = true;
      } else if (arg.startsWith('--skip-duplicates=')) {
        options.skipDuplicates = arg.split('=')[1] === 'true';
      } else if (arg.startsWith('--batch-size=')) {
        options.batchSize = parseInt(arg.split('=')[1]);
      }
    });

    // Validate college code
    if (!COLLEGE_CONFIGS[collegeCode]) {
      console.error(`❌ Unknown college code: ${collegeCode}`);
      console.log(`Available colleges: ${Object.keys(COLLEGE_CONFIGS).join(', ')}`);
      process.exit(1);
    }

    const collegeConfig = COLLEGE_CONFIGS[collegeCode];
    
    console.log(`
🚀 Starting Production Bulk Import
═════════════════════════════════
College: ${collegeConfig.name}
Code: ${collegeConfig.code}
Domain: ${collegeConfig.domain}
CSV File: ${csvFilePath}
Mode: ${options.validateOnly ? 'VALIDATION ONLY' : 'FULL IMPORT'}
    `);

    // Create bulk creator instance
    const creator = new CollegeStudentBulkCreator();

    // Process the CSV
    const result = await creator.processCSV(csvFilePath, collegeConfig, options);

    if (options.validateOnly) {
      console.log('\n✅ Validation completed successfully!');
      console.log(`Ready to create ${result.summary.readyToCreate} students`);
      console.log('\nRun without --validate-only to actually create the students.');
    } else {
      console.log('\n🎉 Bulk import completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Bulk import failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main();