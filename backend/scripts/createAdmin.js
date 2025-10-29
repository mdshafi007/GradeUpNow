// =====================================================
// CREATE ADMIN ACCOUNT FOR LMS
// Run: node scripts/createAdmin.js
// =====================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../src/lms/models/Admin');

// Admin details
const adminData = {
  email: 'shafi272@gmail.com',
  password: 'shafi272',
  name: 'Shafi',
  college: 'Vignan',
  branch: 'CSE',
  role: 'admin'
};

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('\n💡 Delete the existing admin first or use a different email.\n');
      process.exit(1);
    }

    // Create new admin
    console.log('🔄 Creating admin account...');
    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminData.name);
    console.log('🏫 College:', adminData.college);
    console.log('📚 Branch:', adminData.branch);
    console.log('🎭 Role:', adminData.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n🌐 Login URL: http://localhost:5173/college/login');
    console.log('📌 Select "Admin" and use the above credentials\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('💡 Duplicate key error - Admin with this email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createAdmin();
