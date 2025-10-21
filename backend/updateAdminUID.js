// Update admin Firebase UID in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const updateAdminFirebaseUID = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const firebaseUID = 'guSN37N915ZmzneSArIGnthlDlo2';
    const adminEmail = 'vig@ac.in';

    // Find and update the admin record
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: adminEmail },
      { firebaseUid: firebaseUID },
      { new: true }
    );

    if (updatedAdmin) {
      console.log('✅ Admin record updated successfully!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('🔑 Firebase UID:', updatedAdmin.firebaseUid);
      console.log('🏫 College:', updatedAdmin.collegeName);
      console.log('👤 Role:', updatedAdmin.role);
      console.log('\n🎉 Admin can now login at: http://localhost:5173/admin/login');
    } else {
      console.log('❌ Admin record not found with email:', adminEmail);
    }

  } catch (error) {
    console.error('❌ Error updating admin record:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

updateAdminFirebaseUID();