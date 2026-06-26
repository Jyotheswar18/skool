"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SECTIONS = exports.DEFAULT_CLASSES = exports.AUDIENCE_TYPES = exports.NOTIFICATION_STATUS = exports.NOTIFICATION_TYPES = exports.FEE_STATUS = exports.ATTENDANCE_STATUS = exports.STUDENT_STATUS = exports.USER_ROLES = void 0;
exports.USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
};
exports.STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};
exports.ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
};
exports.FEE_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
};
exports.NOTIFICATION_TYPES = {
    ONBOARDING: 'onboarding',
    FEE_REMINDER: 'fee_reminder',
    FEE_OVERDUE: 'fee_overdue',
    ATTENDANCE_ALERT: 'attendance_alert',
    EVENT_BROADCAST: 'event_broadcast',
};
exports.NOTIFICATION_STATUS = {
    QUEUED: 'queued',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
};
exports.AUDIENCE_TYPES = {
    SCHOOL: 'school',
    CLASSES: 'classes',
    SECTIONS: 'sections',
};
exports.DEFAULT_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
exports.DEFAULT_SECTIONS = ['A', 'B', 'C'];
//# sourceMappingURL=constants.js.map