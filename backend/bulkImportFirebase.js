import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { firebaseManager } from './config/firebaseAdmin.js';
import bulkImportService from './services/BulkImportService.js';

dotenv.config();

/**
 * 🔥 WORLD-CLASS BULK IMPORT SCRIPT
 * Firebase + MongoDB integration with comprehensive error handling
 * Usage: node bulkImportFirebase.js <college-config> <csv-file> [options]
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

/**
 * 🚀 Main execution function
 */
async function main() {
  let mongoConnection = null;
  
  try {
    console.log('🔥 FIREBASE + MONGODB BULK IMPORT SYSTEM');
    console.log('═'.repeat(50));
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      showUsage();
      process.exit(1);
    }

    const [collegeKey, csvFile, ...optionArgs] = args;
    
    // Parse options
    const options = parseOptions(optionArgs);
    
    // Validate college config
    const collegeConfig = COLLEGE_CONFIGS[collegeKey.toLowerCase()];
    if (!collegeConfig) {
      console.error(`❌ Invalid college key: ${collegeKey}`);
      console.error(`Available colleges: ${Object.keys(COLLEGE_CONFIGS).join(', ')}`);
      process.exit(1);
    }

    // Initialize connections
    console.log('🔧 INITIALIZING SERVICES...');
    
    // Initialize Firebase
    console.log('🔥 Connecting to Firebase...');
    await firebaseManager.initialize();
    console.log('✅ Firebase connected');

    // Initialize MongoDB
    console.log('📊 Connecting to MongoDB...');
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Process CSV file
    console.log('\n🚀 STARTING BULK IMPORT...');
    const result = await bulkImportService.processCsvFile(csvFile, collegeConfig, options);

    // Display results
    displayResults(result);

    // Exit successfully
    process.exit(0);

  } catch (error) {
    console.error('❌ BULK IMPORT FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Clean up connections
    if (mongoConnection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }
}

/**
 * 📋 Parse command line options
 */
function parseOptions(optionArgs) {
  const options = {
    skipDuplicates: true,
    validateOnly: false,
    batchSize: 10,
    dryRun: false
  };

  optionArgs.forEach(arg => {
    switch (arg.toLowerCase()) {
      case '--no-skip-duplicates':
        options.skipDuplicates = false;
        break;
      case '--validate-only':
        options.validateOnly = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--batch-5':
        options.batchSize = 5;
        break;
      case '--batch-15':
        options.batchSize = 15;
        break;
      case '--batch-20':
        options.batchSize = 20;
        break;
    }
  });

  return options;
}

/**
 * 📖 Show usage information
 */
function showUsage() {
  console.log('🔥 FIREBASE + MONGODB BULK IMPORT');
  console.log('\nUsage:');
  console.log('  node bulkImportFirebase.js <college> <csv-file> [options]');
  console.log('\nColleges:');
  Object.entries(COLLEGE_CONFIGS).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(8)} - ${config.name}`);
  });
  console.log('\nOptions:');
  console.log('  --validate-only        Validate CSV without creating students');
  console.log('  --no-skip-duplicates   Fail if duplicates found (default: skip)');
  console.log('  --dry-run              Show what would be created without doing it');
  console.log('  --batch-5              Process in batches of 5 (default: 10)');
  console.log('  --batch-15             Process in batches of 15');
  console.log('  --batch-20             Process in batches of 20');
  console.log('\nExamples:');
  console.log('  node bulkImportFirebase.js vignan sample-data/vig-students.csv');
  console.log('  node bulkImportFirebase.js mit students.csv --validate-only');
  console.log('  node bulkImportFirebase.js vignan students.csv --dry-run --batch-5');
}

/**
 * 📊 Display final results
 */
function displayResults(result) {
  console.log('\n' + '🏆'.repeat(50));
  console.log('FINAL RESULTS');
  console.log('🏆'.repeat(50));

  if (result.success) {
    console.log('✅ BULK IMPORT COMPLETED SUCCESSFULLY!');
  } else {
    console.log('❌ BULK IMPORT COMPLETED WITH ERRORS');
  }

  console.log(`\n📊 STATISTICS:`);
  console.log(`   College: ${result.college?.name || 'Unknown'}`);
  console.log(`   Duration: ${result.duration ? result.duration.toFixed(2) + 's' : 'N/A'}`);
  console.log(`   Total Records: ${result.stats?.total || 0}`);
  console.log(`   ✅ Successful: ${result.stats?.success || 0}`);
  console.log(`   ❌ Failed: ${result.stats?.failed || 0}`);
  console.log(`   ⚠️  Duplicates: ${result.stats?.duplicates || 0}`);
  console.log(`   🚫 Invalid: ${result.stats?.invalid || 0}`);

  if (result.results?.successful?.length > 0) {
    console.log(`\n🎯 SAMPLE SUCCESSFUL STUDENTS:`);
    result.results.successful.slice(0, 3).forEach(student => {
      console.log(`   ✅ ${student.name} (${student.rollNumber})`);
      console.log(`      Email: ${student.email}`);
      console.log(`      Password: ${student.password}`);
      console.log(`      Firebase UID: ${student.firebaseUid}`);
    });
  }

  if (result.results?.failed?.length > 0) {
    console.log(`\n❌ FAILED STUDENTS:`);
    result.results.failed.slice(0, 5).forEach(student => {
      console.log(`   ❌ ${student.name} (${student.rollNumber}): ${student.error}`);
    });
  }

  console.log(`\n🌐 LOGIN INFORMATION:`);
  console.log(`   Portal URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/college-portal`);
  console.log(`   Students can login with their email and password`);

  if (result.stats?.success > 0) {
    console.log(`\n📁 Detailed reports saved to: reports/${result.college?.code}/`);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, COLLEGE_CONFIGS };