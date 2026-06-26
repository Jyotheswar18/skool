"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfigSchema = void 0;
const zod_1 = require("zod");
exports.updateConfigSchema = zod_1.z.object({
    body: zod_1.z.object({
        schoolName: zod_1.z.string().min(1, 'School name is required').optional(),
        schoolLogo: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        classes: zod_1.z.array(zod_1.z.string()).min(1, 'At least one class is required').optional(),
        sections: zod_1.z.array(zod_1.z.string().toUpperCase()).min(1, 'At least one section is required').optional(),
        academicYear: zod_1.z.string().min(1, 'Academic year is required').optional(),
        whatsapp: zod_1.z.object({
            provider: zod_1.z.enum(['mock', 'wati', 'twilio']),
            apiKey: zod_1.z.string().optional().or(zod_1.z.literal('')),
            apiUrl: zod_1.z.string().optional().or(zod_1.z.literal('')),
            senderNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
            enabled: zod_1.z.boolean(),
        }).optional(),
        feeReminder: zod_1.z.object({
            daysBeforeDue: zod_1.z.number().int().min(1).max(30),
            sendOnDueDate: zod_1.z.boolean(),
            overdueFrequency: zod_1.z.enum(['daily', 'weekly']),
        }).optional(),
        attendanceAlert: zod_1.z.object({
            enabled: zod_1.z.boolean(),
            sendTime: zod_1.z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        }).optional(),
    }),
});
//# sourceMappingURL=schoolConfig.validation.js.map