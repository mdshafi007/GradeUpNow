// Initialize admin data for GradeUpNow Admin System
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const initializeAdminData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Sample admin data
    const sampleAdmins = [
      {
        firebaseUid: 'p2fKU18YhRREA9esWCsgSt68aAo1', // You'll need to replace this with the actual Firebase UID after creating the admin in Firebase Console
        email: 'vig@ac.in', // Replace with actual admin email
        fullName: 'CSE Admin User',
        role: 'admin',
        collegeName: 'Vignan University',
        department: 'CSE', // Computer Science Engineering
        permissions: {
          viewStudents: true,
          manageStudents: true,
          viewReports: true,
          manageQuizzes: false,
          manageContent: false,
        },
        isActive: true,
      }
    ];

    console.log('Initializing admin data...');

    for (const adminData of sampleAdmins) {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (!existingAdmin) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Created admin: ${adminData.email}`);
      } else {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
      }
    }

    console.log('\n📝 IMPORTANT INSTRUCTIONS:');
    console.log('1. Go to Firebase Console');
    console.log('2. Create a user with email and password');
    console.log('3. Copy the Firebase UID from the user');
    console.log('4. Update the firebaseUid field in MongoDB for the admin record');
    console.log('5. The admin can then login using the credentials');

    console.log('\n✅ Admin initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing admin data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

initializeAdminData();