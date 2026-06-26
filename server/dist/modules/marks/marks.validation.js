"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMarksSchema = exports.getStudentMarksSchema = void 0;
const zod_1 = require("zod");
exports.getStudentMarksSchema = zod_1.z.object({
    query: zod_1.z.object({
        class: zod_1.z.string().min(1, 'Class is required'),
        section: zod_1.z.string().min(1, 'Section is required'),
        subject: zod_1.z.string().min(1, 'Subject is required'),
        examName: zod_1.z.string().min(1, 'Exam name is required'),
    }),
});
exports.uploadMarksSchema = zod_1.z.object({
    body: zod_1.z.object({
        class: zod_1.z.string().min(1, 'Class is required'),
        section: zod_1.z.string().min(1, 'Section is required'),
        subject: zod_1.z.string().min(1, 'Subject is required'),
        examName: zod_1.z.string().min(1, 'Exam name is required'),
        maxMarks: zod_1.z.number().min(1, 'Maximum marks must be at least 1').default(100),
        students: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
            marksObtained: zod_1.z.number().min(0, 'Marks obtained cannot be negative'),
            comments: zod_1.z.string().optional().or(zod_1.z.literal('')),
        })).min(1, 'At least one student record is required'),
    }),
});
//# sourceMappingURL=marks.validation.js.map