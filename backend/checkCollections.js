import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAll collections in database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check if college_students collection exists and count documents
    const db = mongoose.connection.db;
    
    console.log('\nCounting documents in each collection:');
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments({});
        console.log(`${col.name}: ${count} documents`);
        
        // If this is college_students, show sample data
        if (col.name === 'college_students' || col.name === 'collegestudents') {
          const sample = await db.collection(col.name).find({}).limit(3).toArray();
          console.log(`Sample data from ${col.name}:`, JSON.stringify(sample, null, 2));
        }
      } catch (error) {
        console.log(`${col.name}: Error counting - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkCollections();