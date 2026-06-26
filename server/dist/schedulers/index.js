"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchedulers = void 0;
const feeReminder_scheduler_1 = require("./feeReminder.scheduler");
const overdueMarker_scheduler_1 = require("./overdueMarker.scheduler");
const initSchedulers = () => {
    console.log('🔄 Initializing background cron schedulers...');
    (0, feeReminder_scheduler_1.initFeeReminderScheduler)();
    (0, overdueMarker_scheduler_1.initOverdueMarkerScheduler)();
    console.log('🏁 All background schedulers initialized.');
};
exports.initSchedulers = initSchedulers;
//# sourceMappingURL=index.js.map