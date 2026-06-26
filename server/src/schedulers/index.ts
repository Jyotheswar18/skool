import { initFeeReminderScheduler } from './feeReminder.scheduler';
import { initOverdueMarkerScheduler } from './overdueMarker.scheduler';

export const initSchedulers = () => {
  console.log('🔄 Initializing background cron schedulers...');
  initFeeReminderScheduler();
  initOverdueMarkerScheduler();
  console.log('🏁 All background schedulers initialized.');
};
