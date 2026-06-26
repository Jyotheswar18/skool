"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminAndConfig = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../modules/auth/user.model");
const schoolConfig_model_1 = require("../modules/schoolConfig/schoolConfig.model");
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const constants_1 = require("../shared/constants");
const seedAdminAndConfig = async () => {
    try {
        // 1. Check if admin exists
        const adminExists = await user_model_1.User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('Seeding admin user...');
            await user_model_1.User.create({
                name: 'School Admin',
                email: env_1.env.ADMIN_EMAIL,
                password: env_1.env.ADMIN_PASSWORD,
                role: 'admin',
                status: 'active',
            });
            console.log(`✅ Seeded admin: ${env_1.env.ADMIN_EMAIL}`);
        }
        else {
            console.log('Admin user already exists.');
        }
        // 1b. Check if demo teacher exists
        const teacherExists = await user_model_1.User.findOne({ email: 'teacher@edunest.com' });
        if (!teacherExists) {
            console.log('Seeding demo teacher user...');
            await user_model_1.User.create({
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
        }
        else {
            console.log('Demo teacher already exists.');
        }
        // 2. Check if default config exists
        const configExists = await schoolConfig_model_1.SchoolConfig.findOne();
        if (!configExists) {
            console.log('Seeding default school configuration...');
            await schoolConfig_model_1.SchoolConfig.create({
                schoolName: 'EduNest School',
                academicYear: '2026-27',
                classes: constants_1.DEFAULT_CLASSES,
                sections: constants_1.DEFAULT_SECTIONS,
                whatsapp: {
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
        }
        else {
            console.log('School configuration already exists.');
        }
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
};
exports.seedAdminAndConfig = seedAdminAndConfig;
// If run directly
if (require.main === module) {
    const runDirectly = async () => {
        await (0, database_1.connectDatabase)();
        await (0, exports.seedAdminAndConfig)();
        await mongoose_1.default.connection.close();
        console.log('Seed process finished, database connection closed.');
        process.exit(0);
    };
    runDirectly();
}
//# sourceMappingURL=admin.seed.js.map