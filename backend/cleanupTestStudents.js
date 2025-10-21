import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { firebaseManager } from './config/firebaseAdmin.js';
import EnhancedCollegeStudent from './models/EnhancedCollegeStudent.js';

dotenv.config();

/**
 * 🧹 CLEAN UP TEST STUDENTS
 * Remove the 4 test students we created
 */

async function cleanupTestStudents() {
  try {
    console.log('🧹 CLEANING UP TEST STUDENTS...\n');

    // Initialize systems
    await firebaseManager.initialize();
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Firebase and MongoDB connected\n');

    const testStudents = [
      '221FA04272', // Shafi
      '221FA04256', // Moksha  
      '221FA04235', // Gowtham
      '221FA04247'  // Saketh
    ];

    let deletedCount = 0;
    let firebaseDeletedCount = 0;

    console.log('🔍 Finding and removing test students...\n');

    for (const rollNumber of testStudents) {
      try {
        console.log(`🎯 Processing: ${rollNumber}`);
        
        // Find student in MongoDB
        const student = await EnhancedCollegeStudent.findOne({ rollNumber });
        
        if (student) {
          console.log(`   📊 Found in MongoDB: ${student.name}`);
          
          // Delete from Firebase first
          if (student.firebaseUid) {
            try {
              await firebaseManager.getServices().admin.auth().deleteUser(student.firebaseUid);
              console.log(`   🔥 Deleted from Firebase: ${student.firebaseUid}`);
              firebaseDeletedCount++;
            } catch (firebaseError) {
              console.log(`   ⚠️  Firebase deletion failed: ${firebaseError.message}`);
            }
          }
          
          // Delete from MongoDB
          await EnhancedCollegeStudent.deleteOne({ _id: student._id });
          console.log(`   📊 Deleted from MongoDB: ${student._id}`);
          deletedCount++;
          
        } else {
          console.log(`   ⚠️  Not found in MongoDB`);
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Error processing ${rollNumber}: ${error.message}`);
      }
    }

    console.log('🏆'.repeat(50));
    console.log('🎉 CLEANUP COMPLETE!');
    console.log('🏆'.repeat(50));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   🔥 Firebase users deleted: ${firebaseDeletedCount}`);
    console.log(`   📊 MongoDB records deleted: ${deletedCount}`);
    console.log(`   ✅ System ready for real student data!`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanupTestStudents();