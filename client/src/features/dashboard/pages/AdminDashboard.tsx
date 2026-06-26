import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, List, Badge, Empty, Spin, Space, Typography } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  BellOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import { Event, NotificationLog } from '../../../types/common.types';

export const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/admin');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading dashboard data..." />
      </div>
    );
  }

  const { stats, recentEvents, recentNotifications } = dashboardData || {
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalFeesExpected: 0,
      totalFeesCollected: 0,
      totalFeesPending: 0,
      totalFeesOverdue: 0,
      todayAttendance: { present: 0, absent: 0, late: 0, total: 0 },
    },
    recentEvents: [],
    recentNotifications: [],
  };

  const attendancePercentage =
    stats.todayAttendance.total > 0
      ? Math.round(
          ((stats.todayAttendance.present + stats.todayAttendance.late) /
            stats.todayAttendance.total) *
            100
        )
      : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Dashboard</h2>
        <span style={{ color: '#475569' }}>Real-time overview of your school's activities</span>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card">
            <Statistic
              title="Active Students"
              value={stats.totalStudents}
              prefix={<UserOutlined style={{ color: '#4f46e5', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card">
            <Statistic
              title="Active Teachers"
              value={stats.totalTeachers}
              prefix={<TeamOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card">
            <Statistic
              title="Today's Attendance"
              value={stats.todayAttendance.total > 0 ? `${attendancePercentage}%` : 'N/A'}
              suffix={stats.todayAttendance.total > 0 ? `(${stats.todayAttendance.present}/${stats.todayAttendance.total})` : ''}
              prefix={<CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card">
            <Statistic
              title="Fees Collected"
              value={stats.totalFeesCollected}
              precision={0}
              prefix={<DollarOutlined style={{ color: '#6366f1', marginRight: 8 }} />}
              suffix={`/ ₹${stats.totalFeesExpected}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary metrics (Dues) */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={12}>
          <Card
            title={<span style={{ color: '#475569' }}>Pending Fees</span>}
            className="premium-card"
            style={{ borderLeft: '4px solid #f59e0b' }}
          >
            <Title level={3} style={{ margin: 0, color: '#f59e0b' }}>
              ₹{stats.totalFeesPending}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card
            title={<span style={{ color: '#475569' }}>Overdue Fees</span>}
            className="premium-card"
            style={{ borderLeft: '4px solid #ef4444' }}
          >
            <Title level={3} style={{ margin: 0, color: '#ef4444' }}>
              ₹{stats.totalFeesOverdue}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Recents Lists */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#4f46e5' }} />
                <span>Recent School Events</span>
              </Space>
            }
            className="premium-card"
            style={{ height: '100%' }}
          >
            {recentEvents.length === 0 ? (
              <Empty description="No events created yet" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentEvents}
                renderItem={(item: Event) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<strong>{item.title}</strong>}
                      description={
                        <Space orientation="vertical" size={2}>
                          <span>{item.description ? item.description.substring(0, 80) + '...' : 'No description'}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            Event Date: {new Date(item.eventDate).toLocaleDateString()} |{' '}
                            {item.isPublished ? (
                              <Tag color="green">Published</Tag>
                            ) : (
                              <Tag color="orange">Draft</Tag>
                            )}
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: '#f59e0b' }} />
                <span>Recent Notifications sent</span>
              </Space>
            }
            className="premium-card"
            style={{ height: '100%' }}
          >
            {recentNotifications.length === 0 ? (
              <Empty description="No notifications logged" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentNotifications}
                renderItem={(item: NotificationLog) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <strong>{item.recipient.name}</strong>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>({item.recipient.phone})</span>
                        </Space>
                      }
                      description={
                        <Space orientation="vertical" size={2}>
                          <span style={{ fontSize: 12, color: '#475569' }}>{item.message}</span>
                          <Space style={{ fontSize: 11, color: '#94a3b8' }}>
                            <span>Type: <Tag>{item.type.replace('_', ' ')}</Tag></span>
                            <span>
                              Status:{' '}
                              {item.status === 'sent' && <Badge status="success" text="Sent" />}
                              {item.status === 'queued' && <Badge status="processing" text="Queued" />}
                              {item.status === 'failed' && <Badge status="error" text="Failed" />}
                            </span>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const { Title } = Typography;
export default AdminDashboard;
