import cron from 'node-cron';
import { FeeService } from '../modules/fee/fee.service';

export const initOverdueMarkerScheduler = () => {
  // Run daily at 1:00 AM
  // Format: minute hour day-of-month month day-of-week
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ Running daily overdue marker cron job at 1:00 AM...');
    try {
      const updatedCount = await FeeService.markPendingAsOverdue();
      console.log(`✅ Daily overdue marker finished. Marked ${updatedCount} as overdue.`);
    } catch (error) {
      console.error('❌ Error executing overdue marker cron job:', error);
    }
  });
  console.log('📅 Overdue marker scheduler registered (Daily at 1:00 AM)');
};
