import mongoose from 'mongoose';
import { env } from './src/config/env';

const clearDatabase = async () => {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not initialized');
  }

  // 1. Delete Student Records
  console.log('🧹 Deleting students...');
  await db.collection('students').deleteMany({});

  // 2. Delete Teacher Records & their associated User accounts
  console.log('🧹 Deleting teachers and teacher user accounts...');
  await db.collection('teachers').deleteMany({});
  await db.collection('users').deleteMany({ role: 'teacher' });

  // 3. Delete related logs & schedules (Attendance, Installments, Marks, Notifications)
  console.log('🧹 Deleting attendances, installments, marks, and notification history...');
  await db.collection('attendances').deleteMany({});
  await db.collection('installments').deleteMany({});
  await db.collection('marks').deleteMany({});
  await db.collection('notifications').deleteMany({});

  // 4. Delete Event Records
  console.log('🧹 Deleting events...');
  await db.collection('events').deleteMany({});

  console.log('✨ Database clean-up successfully completed!');
  await mongoose.disconnect();
  process.exit(0);
};

clearDatabase().catch((err) => {
  console.error('❌ Clean-up failed:', err);
  process.exit(1);
});
