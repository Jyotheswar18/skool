import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'teacher')[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: '24px',
        }}
      >
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button
              type="primary"
              onClick={() => {
                if (user?.role === 'teacher') {
                  navigate('/teacher/dashboard');
                } else {
                  navigate('/admin/dashboard');
                }
              }}
            >
              Back Home
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
