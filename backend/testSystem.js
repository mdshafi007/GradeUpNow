import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { firebaseManager } from './config/firebaseAdmin.js';

dotenv.config();

/**
 * 🧪 SIMPLE TEST SCRIPT
 * Test Firebase + MongoDB connection
 */

async function testSystem() {
  try {
    console.log('🧪 Testing Firebase + MongoDB System...\n');

    // Test Firebase
    console.log('🔥 Testing Firebase...');
    await firebaseManager.initialize();
    console.log('✅ Firebase connection successful\n');

    // Test MongoDB  
    console.log('📊 Testing MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful\n');

    console.log('🎉 ALL SYSTEMS WORKING! Ready for bulk import.');

  } catch (error) {
    console.error('❌ System test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testSystem();