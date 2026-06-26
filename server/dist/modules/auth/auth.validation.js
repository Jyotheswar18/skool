"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Please enter a valid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().min(1, 'Old password is required'),
        newPassword: zod_1.z.string()
            .min(8, 'New password must be at least 8 characters')
            .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'New password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'New password must contain at least one special character'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
//# sourceMappingURL=auth.validation.js.map