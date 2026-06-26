import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

const BASE_URL = 'http://localhost:5000';

describe('EduNest API Integration Tests', () => {
  let accessToken: string;
  let refreshToken: string;

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(BASE_URL).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('healthy');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with invalid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'wrong@edunest.com', password: 'wrongpassword' });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should login successfully with admin credentials', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'admin@edunest.com', password: 'Admin@123' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.role).toBe('admin');
      
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });
  });

  describe('GET /api/students', () => {
    it('should refuse access without token', async () => {
      const response = await request(BASE_URL).get('/api/students');
      expect(response.status).toBe(401);
    });

    it('should allow access with valid admin token', async () => {
      const response = await request(BASE_URL)
        .get('/api/students')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
