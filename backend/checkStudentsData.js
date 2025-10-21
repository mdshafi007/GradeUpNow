import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CollegeStudent from './models/CollegeStudent.js';
import Admin from './models/Admin.js';

dotenv.config();

async function checkStudentsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check total students
    const totalStudents = await CollegeStudent.countDocuments({});
    console.log('Total students in database:', totalStudents);
    
    // Check vignan students
    const vignanStudents = await CollegeStudent.countDocuments({ collegeCode: 'vignan' });
    console.log('Vignan students:', vignanStudents);
    
    // Check active vignan students
    const activeVignanStudents = await CollegeStudent.countDocuments({ collegeCode: 'vignan', isActive: true });
    console.log('Active Vignan students:', activeVignanStudents);
    
    // Check CSE students at vignan
    const cseStudents = await CollegeStudent.countDocuments({ collegeCode: 'vignan', department: 'CSE' });
    console.log('CSE students at Vignan:', cseStudents);
    
    // Check active CSE students at vignan
    const activeCseStudents = await CollegeStudent.countDocuments({ collegeCode: 'vignan', department: 'CSE', isActive: true });
    console.log('Active CSE students at Vignan:', activeCseStudents);
    
    // Check what departments exist at vignan
    const departments = await CollegeStudent.distinct('department', { collegeCode: 'vignan' });
    console.log('Departments at Vignan:', departments);
    
    // Show sample student records
    const sampleStudents = await CollegeStudent.find({ collegeCode: 'vignan' }).limit(5).select('rollNumber name department collegeCode isActive');
    console.log('Sample Vignan students:');
    sampleStudents.forEach(student => {
      console.log(`- ${student.rollNumber} | ${student.name} | ${student.department} | Active: ${student.isActive}`);
    });
    
    // Check admin data
    console.log('\n--- Admin Data ---');
    const admin = await Admin.findOne({ email: 'vig@ac.in' });
    if (admin) {
      console.log(`Admin: ${admin.fullName}`);
      console.log(`College: ${admin.collegeName}`);
      console.log(`Department: ${admin.department}`);
      console.log(`Active: ${admin.isActive}`);
    } else {
      console.log('Admin not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkStudentsData();