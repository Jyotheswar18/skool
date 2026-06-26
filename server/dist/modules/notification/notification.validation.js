"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryNotificationsSchema = void 0;
const zod_1 = require("zod");
exports.queryNotificationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        type: zod_1.z.enum(['onboarding', 'fee_reminder', 'fee_overdue', 'attendance_alert', 'event_broadcast']).optional(),
        status: zod_1.z.enum(['queued', 'sent', 'delivered', 'failed']).optional(),
        search: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=notification.validation.js.map