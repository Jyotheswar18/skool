"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTeachersSchema = exports.getTeacherSchema = exports.resetTeacherPasswordSchema = exports.updateTeacherSchema = exports.createTeacherSchema = void 0;
const zod_1 = require("zod");
exports.createTeacherSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        email: zod_1.z.string().email('Please enter a valid email'),
        password: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
        mobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional().or(zod_1.z.literal('')),
        assignedClasses: zod_1.z.array(zod_1.z.string()).default([]),
        assignedSections: zod_1.z.array(zod_1.z.string().toUpperCase()).default([]),
        status: zod_1.z.enum(['active', 'inactive']).default('active'),
    }),
});
exports.updateTeacherSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
        email: zod_1.z.string().email('Please enter a valid email').optional(),
        mobile: zod_1.z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional().or(zod_1.z.literal('')),
        assignedClasses: zod_1.z.array(zod_1.z.string()).optional(),
        assignedSections: zod_1.z.array(zod_1.z.string().toUpperCase()).optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});
exports.resetTeacherPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
    }),
    body: zod_1.z.object({
        newPassword: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    }),
});
exports.getTeacherSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
    }),
});
exports.queryTeachersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});
//# sourceMappingURL=teacher.validation.js.map