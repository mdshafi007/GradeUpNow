require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Student = require('../src/lms/models/Student');

async function deleteAllStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await Student.deleteMany({});
    console.log(`Deleted ${result.deletedCount} students`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAllStudents();
