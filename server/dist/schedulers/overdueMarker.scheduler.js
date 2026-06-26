"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOverdueMarkerScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const fee_service_1 = require("../modules/fee/fee.service");
const initOverdueMarkerScheduler = () => {
    // Run daily at 1:00 AM
    // Format: minute hour day-of-month month day-of-week
    node_cron_1.default.schedule('0 1 * * *', async () => {
        console.log('⏰ Running daily overdue marker cron job at 1:00 AM...');
        try {
            const updatedCount = await fee_service_1.FeeService.markPendingAsOverdue();
            console.log(`✅ Daily overdue marker finished. Marked ${updatedCount} as overdue.`);
        }
        catch (error) {
            console.error('❌ Error executing overdue marker cron job:', error);
        }
    });
    console.log('📅 Overdue marker scheduler registered (Daily at 1:00 AM)');
};
exports.initOverdueMarkerScheduler = initOverdueMarkerScheduler;
//# sourceMappingURL=overdueMarker.scheduler.js.map