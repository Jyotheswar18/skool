import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BankOutlined,
  FormOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const TeacherLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/teacher/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'attendance-group',
      icon: <CalendarOutlined />,
      label: 'Attendance & Marks',
      children: [
        {
          key: '/teacher/attendance',
          icon: <CheckSquareOutlined />,
          label: 'Mark Attendance',
        },
        {
          key: '/teacher/marks',
          icon: <FormOutlined />,
          label: 'Upload Marks',
        },
      ],
    },
  ];


  const handleMenuClick = (info: any) => {
    navigate(info.key);
    setMobileVisible(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: '#ffffff',
        }}
      >
        <Space size="middle">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#0b4c33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#eab308',
              fontSize: 18,
            }}
          >
            <BankOutlined />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                EduNest
              </div>
              <div style={{ fontSize: '9px', fontWeight: 600, color: '#0b4c33', letterSpacing: '0.5px' }}>
                Management System
              </div>
            </div>
          )}
        </Space>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['attendance-group']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, flex: 1, paddingTop: 16 }}
      />

      <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          style={{
            textAlign: collapsed ? 'center' : 'left',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        theme="light"
        style={{
          borderRight: '1px solid rgba(0,0,0,0.06)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: 'none',
        }}
        className="desktop-sider"
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        size={240}
        styles={{ body: { padding: 0 } }}
      >
        {sidebarContent}
      </Drawer>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }} className="layout-body">
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="desktop-toggle-btn"
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileVisible(true)}
              className="mobile-toggle-btn"
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                display: 'none',
              }}
            />
            <Text type="secondary" className="header-role-tag" style={{ marginLeft: 8 }}>
              Assigned Teacher
            </Text>
          </Space>

          <Space size="large">
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#0ea5e9' }} icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }} className="header-user-info">
                  <Text strong>{user?.name || 'Teacher'}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user?.email}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            minHeight: 280,
          }}
        >
          <div className="fade-in">
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* Simple Inline Styles for Responsive layouts */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-sider {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .layout-body {
            margin-left: 0 !important;
          }
          .desktop-toggle-btn {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: inline-block !important;
          }
          .header-role-tag, .header-user-info {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default TeacherLayout;
