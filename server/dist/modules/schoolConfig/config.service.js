"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const schoolConfig_model_1 = require("./schoolConfig.model");
const constants_1 = require("../../shared/constants");
class ConfigService {
}
exports.ConfigService = ConfigService;
_a = ConfigService;
/**
 * Fetch school config (singleton, creates one if none exists)
 */
ConfigService.getConfig = async () => {
    let config = await schoolConfig_model_1.SchoolConfig.findOne();
    if (!config) {
        config = await schoolConfig_model_1.SchoolConfig.create({
            schoolName: 'EduNest School',
            academicYear: '2026-27',
            classes: constants_1.DEFAULT_CLASSES,
            sections: constants_1.DEFAULT_SECTIONS,
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
    }
    return config;
};
/**
 * Update school config
 */
ConfigService.updateConfig = async (updateData) => {
    let config = await schoolConfig_model_1.SchoolConfig.findOne();
    if (!config) {
        config = new schoolConfig_model_1.SchoolConfig(updateData);
    }
    else {
        config.set(updateData);
    }
    await config.save();
    return config;
};
//# sourceMappingURL=config.service.js.map