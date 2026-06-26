"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: zod_1.z.string().min(10, 'JWT_SECRET must be at least 10 chars'),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    ADMIN_EMAIL: zod_1.z.string().email().default('admin@edunest.com'),
    ADMIN_PASSWORD: zod_1.z.string().min(6).default('Admin@123'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_KEY: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional().default(''),
    WHATSAPP_PROVIDER: zod_1.z.enum(['mock', 'wati', 'twilio']).default('mock'),
    WHATSAPP_API_KEY: zod_1.z.string().optional().default(''),
    WHATSAPP_API_URL: zod_1.z.string().optional().default(''),
    WHATSAPP_SENDER_NUMBER: zod_1.z.string().optional().default(''),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map