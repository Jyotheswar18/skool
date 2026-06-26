"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const BASE_URL = 'http://localhost:5000';
(0, globals_1.describe)('EduNest API Integration Tests', () => {
    let accessToken;
    let refreshToken;
    (0, globals_1.describe)('GET /health', () => {
        (0, globals_1.it)('should return 200 and health status', async () => {
            const response = await (0, supertest_1.default)(BASE_URL).get('/health');
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toContain('healthy');
        });
    });
    (0, globals_1.describe)('POST /api/auth/login', () => {
        (0, globals_1.it)('should fail with invalid credentials', async () => {
            const response = await (0, supertest_1.default)(BASE_URL)
                .post('/api/auth/login')
                .send({ email: 'wrong@edunest.com', password: 'wrongpassword' });
            (0, globals_1.expect)(response.status).toBe(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should login successfully with admin credentials', async () => {
            const response = await (0, supertest_1.default)(BASE_URL)
                .post('/api/auth/login')
                .send({ email: 'admin@edunest.com', password: 'Admin@123' });
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data).toHaveProperty('accessToken');
            (0, globals_1.expect)(response.body.data).toHaveProperty('refreshToken');
            (0, globals_1.expect)(response.body.data.user.role).toBe('admin');
            accessToken = response.body.data.accessToken;
            refreshToken = response.body.data.refreshToken;
        });
    });
    (0, globals_1.describe)('GET /api/students', () => {
        (0, globals_1.it)('should refuse access without token', async () => {
            const response = await (0, supertest_1.default)(BASE_URL).get('/api/students');
            (0, globals_1.expect)(response.status).toBe(401);
        });
        (0, globals_1.it)('should allow access with valid admin token', async () => {
            const response = await (0, supertest_1.default)(BASE_URL)
                .get('/api/students')
                .set('Authorization', `Bearer ${accessToken}`);
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
//# sourceMappingURL=api.test.js.map