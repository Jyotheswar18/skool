"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceReportSchema = exports.getAttendanceSchema = exports.markAttendanceSchema = void 0;
const zod_1 = require("zod");
const attendanceRecordItemSchema = zod_1.z.object({
    student: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
    status: zod_1.z.enum(['present', 'absent', 'late']),
});
exports.markAttendanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        class: zod_1.z.string().min(1, 'Class is required'),
        section: zod_1.z.string().min(1, 'Section is required').max(5),
        date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format (must be YYYY-MM-DD)',
        }),
        records: zod_1.z.array(attendanceRecordItemSchema).min(1, 'At least one student record is required'),
    }),
});
exports.getAttendanceSchema = zod_1.z.object({
    query: zod_1.z.object({
        class: zod_1.z.string().optional(),
        section: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        student: zod_1.z.string().optional(),
    }),
});
exports.getAttendanceReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        class: zod_1.z.string().min(1, 'Class is required'),
        section: zod_1.z.string().min(1, 'Section is required'),
        startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid startDate',
        }),
        endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid endDate',
        }),
    }),
});
//# sourceMappingURL=attendance.validation.js.map