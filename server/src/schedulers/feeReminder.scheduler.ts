import cron from 'node-cron';
import { FeeService } from '../modules/fee/fee.service';

export const initFeeReminderScheduler = () => {
  // Run daily at 9:00 AM
  // Format: minute hour day-of-month month day-of-week
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily fee reminder cron job at 9:00 AM...');
    try {
      await FeeService.sendScheduledReminders();
      console.log('✅ Daily fee reminder notifications sent successfully.');
    } catch (error) {
      console.error('❌ Error executing fee reminder cron job:', error);
    }
  });
  console.log('📅 Fee reminder scheduler registered (Daily at 9:00 AM)');
};
