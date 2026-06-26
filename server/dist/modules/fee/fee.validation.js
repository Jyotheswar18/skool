"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeeReportSchema = exports.getStudentInstallmentsSchema = exports.payInstallmentSchema = void 0;
const zod_1 = require("zod");
exports.payInstallmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid installment ID format'),
    }),
    body: zod_1.z.object({
        notes: zod_1.z.string().max(500).optional(),
    }),
});
exports.getStudentInstallmentsSchema = zod_1.z.object({
    params: zod_1.z.object({
        studentId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
    }),
});
exports.getFeeReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        class: zod_1.z.string().optional(),
        section: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'paid', 'overdue']).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=fee.validation.js.map