import mongoose from 'mongoose';
import { User } from '../modules/auth/user.model';
import { SchoolConfig } from '../modules/schoolConfig/schoolConfig.model';
import { env } from '../config/env';
import { connectDatabase } from '../config/database';
import { DEFAULT_CLASSES, DEFAULT_SECTIONS } from '../shared/constants';

export const seedAdminAndConfig = async () => {
  try {
    // 1. Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding admin user...');
      await User.create({
        name: 'School Admin',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
        status: 'active',
      });
      console.log(`✅ Seeded admin: ${env.ADMIN_EMAIL}`);
    } else {
      console.log('Admin user already exists.');
    }

    // 1b. Check if demo teacher exists
    const teacherExists = await User.findOne({ email: 'teacher@edunest.com' });
    if (!teacherExists) {
      console.log('Seeding demo teacher user...');
      await User.create({
        name: 'Demo Teacher',
        email: 'teacher@edunest.com',
        password: 'Teacher@123',
        role: 'teacher',
        status: 'active',
        mobile: '9876543211',
        assignedClasses: ['6', '7', '8', '9', '10'],
        assignedSections: ['A', 'B'],
      });
      console.log('✅ Seeded demo teacher: teacher@edunest.com');
    } else {
      console.log('Demo teacher already exists.');
    }

    // 2. Check if default config exists
    const configExists = await SchoolConfig.findOne();
    if (!configExists) {
      console.log('Seeding default school configuration...');
      await SchoolConfig.create({
        schoolName: 'EduNest School',
        academicYear: '2026-27',
        classes: DEFAULT_CLASSES,
        sections: DEFAULT_SECTIONS,

        sms: {
          provider: 'mock',
          enabled: true,
        },
        feeReminder: {
          daysBeforeDue: 3,
          sendOnDueDate: true,
          overdueFrequency: 'weekly',
        },
        attendanceAlert: {
          enabled: false,
          sendTime: '10:00',
        },
      });
      console.log('✅ Seeded default school config');
    } else {
      console.log('School configuration already exists.');
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};

// If run directly
if (require.main === module) {
  const runDirectly = async () => {
    await connectDatabase();
    await seedAdminAndConfig();
    await mongoose.connection.close();
    console.log('Seed process finished, database connection closed.');
    process.exit(0);
  };
  runDirectly();
}
