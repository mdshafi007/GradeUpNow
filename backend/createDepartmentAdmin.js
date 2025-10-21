// Script to create department-specific admins
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createDepartmentAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // You can modify these admin details as needed
    const departmentAdmins = [
      {
        firebaseUid: 'REPLACE_WITH_FIREBASE_UID_1', 
        email: 'ece.admin@vignan.ac.in',
        fullName: 'ECE Department Admin',
        role: 'admin',
        collegeName: 'Vignan University',
        department: 'ECE', // Electronics and Communication Engineering
        permissions: {
          viewStudents: true,
          manageStudents: true,
          viewReports: true,
          manageQuizzes: false,
          manageContent: false,
        },
        isActive: true,
      },
      {
        firebaseUid: 'REPLACE_WITH_FIREBASE_UID_2',
        email: 'eee.admin@vignan.ac.in',
        fullName: 'EEE Department Admin',
        role: 'admin',
        collegeName: 'Vignan University',
        department: 'EEE', // Electrical and Electronics Engineering
        permissions: {
          viewStudents: true,
          manageStudents: true,
          viewReports: true,
          manageQuizzes: false,
          manageContent: false,
        },
        isActive: true,
      },
      {
        firebaseUid: 'REPLACE_WITH_FIREBASE_UID_3',
        email: 'mech.admin@vignan.ac.in',
        fullName: 'MECH Department Admin',
        role: 'admin',
        collegeName: 'Vignan University',
        department: 'MECH', // Mechanical Engineering
        permissions: {
          viewStudents: true,
          manageStudents: true,
          viewReports: true,
          manageQuizzes: false,
          manageContent: false,
        },
        isActive: true,
      },
      {
        firebaseUid: 'REPLACE_WITH_FIREBASE_UID_4',
        email: 'civil.admin@vignan.ac.in',
        fullName: 'CIVIL Department Admin',
        role: 'admin',
        collegeName: 'Vignan University',
        department: 'CIVIL', // Civil Engineering
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

    console.log('Creating department admins...');

    for (const adminData of departmentAdmins) {
      // Skip if Firebase UID is not replaced
      if (adminData.firebaseUid.startsWith('REPLACE_WITH_FIREBASE_UID')) {
        console.log(`⚠️  Skipping ${adminData.email} - Please replace Firebase UID first`);
        continue;
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (!existingAdmin) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Created admin: ${adminData.email} (Department: ${adminData.department})`);
      } else {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
      }
    }

    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. For each admin you want to create:');
    console.log('2. Create a Firebase user with email and password in Firebase Console');
    console.log('3. Copy the Firebase UID from the user');
    console.log('4. Replace the REPLACE_WITH_FIREBASE_UID_X with the actual Firebase UID in this script');
    console.log('5. Run this script again');
    console.log('\n✅ Department admin creation process completed!');

  } catch (error) {
    console.error('Error creating department admins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDepartmentAdmin();