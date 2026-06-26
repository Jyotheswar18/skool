"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFeeReminderScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const fee_service_1 = require("../modules/fee/fee.service");
const initFeeReminderScheduler = () => {
    // Run daily at 9:00 AM
    // Format: minute hour day-of-month month day-of-week
    node_cron_1.default.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily fee reminder cron job at 9:00 AM...');
        try {
            await fee_service_1.FeeService.sendScheduledReminders();
            console.log('✅ Daily fee reminder notifications sent successfully.');
        }
        catch (error) {
            console.error('❌ Error executing fee reminder cron job:', error);
        }
    });
    console.log('📅 Fee reminder scheduler registered (Daily at 9:00 AM)');
};
exports.initFeeReminderScheduler = initFeeReminderScheduler;
//# sourceMappingURL=feeReminder.scheduler.js.map