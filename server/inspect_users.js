const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edunest';

const checkUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find().toArray();
    console.log('--- Database Users ---');
    users.forEach((u) => {
      console.log(`Email: "${u.email}", Role: "${u.role}", Status: "${u.status}"`);
    });
    console.log('----------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkUsers();
