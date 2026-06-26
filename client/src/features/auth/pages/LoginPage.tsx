import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../../../api/axios';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { message } = App.useApp();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'admin' | 'teacher'>('admin');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken, user: loggedInUser } = res.data.data;
      
      // Validate role mismatch
      if (loggedInUser.role !== activeRole) {
        if (activeRole === 'admin') {
          throw new Error('This account is registered as a Teacher. Please switch to the Teacher Portal tab to log in.');
        } else {
          throw new Error('This account is registered as an Admin. Please switch to the Admin Portal tab to log in.');
        }
      }

      // Update local storage and auth context
      login(accessToken, refreshToken, loggedInUser);
      message.success(`Welcome back, ${loggedInUser.name}!`);

      // Determine redirect path
      const from = loggedInUser.role === 'admin' 
        ? '/admin/dashboard' 
        : '/teacher/dashboard';

      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      const errMsg = error.message || error.response?.data?.error?.message || 'Invalid email or password';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b4c33 0%, #032014 100%)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Geometric background pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px',
          zIndex: 0,
        }}
      />
      
      {/* Subtle gold radial background glows */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(234, 179, 8, 0.12)',
          top: '-10%',
          left: '10%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(234, 179, 8, 0.12)',
          bottom: '-10%',
          right: '10%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />

      {/* Centered Professional Login Card */}
      <div
        className="premium-card fade-in"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '3px solid #eab308',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '44px 36px',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 16,
              background: '#0b4c33',
              color: '#eab308',
              fontSize: 30,
              marginBottom: 16,
              boxShadow: '0 8px 16px rgba(11, 76, 51, 0.25)',
            }}
          >
            <BankOutlined />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            EduNest
          </Title>
          <Text style={{ color: '#475569', fontSize: '13px', fontWeight: 600, marginTop: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            School Management System
          </Text>
        </div>

        {/* Custom Segmented Portal Switcher */}
        <div 
          style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '12px', 
            marginBottom: 28,
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '8px',
              border: 'none',
              background: activeRole === 'admin' ? '#0b4c33' : 'transparent',
              color: activeRole === 'admin' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Admin Portal
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('teacher')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '8px',
              border: 'none',
              background: activeRole === 'teacher' ? '#0b4c33' : 'transparent',
              color: activeRole === 'teacher' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Teacher Portal
          </button>
        </div>

        {/* Form Fields */}
        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            style={{ marginBottom: 20 }}
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <div>
              <Text style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Email Address
              </Text>
              <Input 
                prefix={<UserOutlined style={{ color: '#64748b', marginRight: 8 }} />} 
                placeholder={activeRole === 'admin' ? 'admin@edunest.com' : 'teacher@edunest.com'} 
                style={{ borderRadius: 8, height: 44, border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            style={{ marginBottom: 28 }}
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <div>
              <Text style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Password
              </Text>
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#64748b', marginRight: 8 }} />} 
                placeholder="••••••••" 
                style={{ borderRadius: 8, height: 44, border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              style={{ 
                height: 46, 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: '15px',
                background: '#0b4c33',
                borderColor: '#0b4c33',
                boxShadow: '0 4px 12px rgba(11, 76, 51, 0.3)',
              }}
            >
              Sign In to {activeRole === 'admin' ? 'Admin' : 'Teacher'} Portal
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Footer copyright */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '20px', 
          fontSize: '12px', 
          color: 'rgba(255, 255, 255, 0.4)', 
          zIndex: 1 
        }}
      >
        © 2026 EduNest Academy. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
