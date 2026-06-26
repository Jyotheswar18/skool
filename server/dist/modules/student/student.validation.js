"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStudentsSchema = exports.getStudentSchema = exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required'),
        class: zod_1.z.string().min(1, 'Class is required'),
        section: zod_1.z.string().min(1, 'Section is required').max(5),
        parentName: zod_1.z.string().min(2, 'Parent name is required').max(100),
        parentMobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits'),
        alternateMobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Alternate mobile number must be exactly 10 digits').optional().or(zod_1.z.literal('')),
        parentEmail: zod_1.z.string().email('Invalid parent email format').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional(),
        joiningDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid joining date format',
        }),
        totalFee: zod_1.z.number().min(0, 'Total fee cannot be negative'),
        numberOfInstallments: zod_1.z.number().int().min(1, 'At least 1 installment required').max(12, 'Maximum 12 installments allowed'),
        feeEndDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid fee end date format',
        }).optional(),
        status: zod_1.z.enum(['active', 'inactive']).default('active'),
    }),
});
exports.updateStudentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
        class: zod_1.z.string().min(1, 'Class is required').optional(),
        section: zod_1.z.string().min(1, 'Section is required').max(5).optional(),
        parentName: zod_1.z.string().min(2, 'Parent name is required').max(100).optional(),
        parentMobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits').optional(),
        alternateMobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Alternate mobile number must be exactly 10 digits').optional().or(zod_1.z.literal('')),
        parentEmail: zod_1.z.string().email('Invalid parent email format').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional(),
        joiningDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid joining date format',
        }).optional(),
        totalFee: zod_1.z.number().min(0, 'Total fee cannot be negative').optional(),
        numberOfInstallments: zod_1.z.number().int().min(1, 'At least 1 installment required').max(12, 'Maximum 12 installments allowed').optional(),
        feeEndDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid fee end date format',
        }).optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});
exports.getStudentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
    }),
});
exports.queryStudentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        class: zod_1.z.string().optional(),
        section: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
        sortBy: zod_1.z.string().optional(),
        order: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
//# sourceMappingURL=student.validation.js.map