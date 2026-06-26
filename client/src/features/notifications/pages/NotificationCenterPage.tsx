import React, { useState } from 'react';
import { Table, Card, Input, Select, Space, Tag, Row, Col, Badge, Spin, Typography, Button, Statistic } from 'antd';
import { SearchOutlined, BellOutlined, CheckCircleOutlined, AlertOutlined, LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import { NotificationLog } from '../../../types/common.types';

const { Option } = Select;
const { Title, Text } = Typography;

export const NotificationCenterPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Fetch log statistics
  const { data: statsData } = useQuery({
    queryKey: ['notificationStats'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/stats');
      return res.data.data;
    },
  });

  // Fetch notifications
  const { data: logData, isLoading } = useQuery({
    queryKey: ['notifications', page, search, type, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (status) params.append('status', status);

      const res = await apiClient.get(`/notifications?${params.toString()}`);
      return res.data;
    },
  });

  const columns = [
    {
      title: 'Recipient',
      key: 'recipient',
      render: (_: any, record: NotificationLog) => (
        <Space orientation="vertical" size={1}>
          <strong>{record.recipient.name}</strong>
          <span style={{ fontSize: 11, color: '#475569' }}>({record.recipient.phone})</span>
          {record.recipient.studentId && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Student: {record.recipient.studentId.name} (Class {record.recipient.studentId.class}-{record.recipient.studentId.section})
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Notification Type',
      dataIndex: 'type',
      key: 'type',
      render: (val: string) => {
        let color = 'default';
        if (val === 'onboarding') color = 'blue';
        if (val === 'fee_reminder') color = 'cyan';
        if (val === 'fee_overdue') color = 'volcano';
        if (val === 'attendance_alert') color = 'magenta';
        if (val === 'event_broadcast') color = 'purple';
        return <Tag color={color}>{val.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Message Content',
      dataIndex: 'message',
      key: 'message',
      width: '40%',
      render: (text: string) => <span style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{text}</span>,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: NotificationLog) => {
        if (record.status === 'sent') return <Badge status="success" text="Sent" />;
        if (record.status === 'queued') return <Badge status="processing" text="Queued" />;
        if (record.status === 'failed') {
          return (
            <Space orientation="vertical" size={2}>
              <Badge status="error" text="Failed" />
              <span style={{ fontSize: 10, color: '#ef4444' }}>{record.errorMessage}</span>
            </Space>
          );
        }
        return <Badge status="default" text="Unknown" />;
      },
    },
    {
      title: 'Dispatched At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const stats = statsData || { queued: 0, sent: 0, failed: 0, delivered: 0 };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Notification Center</h2>
        <span style={{ color: '#475569' }}>Centralized logs and delivery tracking for all outgoing SMS automations</span>
      </div>

      {/* Stats row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="premium-card">
            <Statistic
              title="Dispatched"
              value={stats.sent}
              prefix={<CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="premium-card">
            <Statistic
              title="Failed Delivery"
              value={stats.failed}
              prefix={<AlertOutlined style={{ color: '#ef4444', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="premium-card">
            <Statistic
              title="Queued"
              value={stats.queued}
              prefix={<LoadingOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="premium-card">
            <Statistic
              title="Delivery Success Rate"
              value={stats.sent + stats.failed > 0 ? Math.round((stats.sent / (stats.sent + stats.failed)) * 100) : 100}
              suffix="%"
              prefix={<BellOutlined style={{ color: '#6366f1', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Input
              placeholder="Search recipient name, phone, or message text..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter Notification Type"
              value={type}
              onChange={setType}
              allowClear
            >
              <Option value="onboarding">Onboarding</Option>
              <Option value="fee_reminder">Fee Reminder</Option>
              <Option value="fee_overdue">Fee Overdue</Option>
              <Option value="attendance_alert">Attendance Alert</Option>
              <Option value="event_broadcast">Event Broadcast</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter Status"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="sent">Sent</Option>
              <Option value="queued">Queued</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Button
              onClick={() => {
                setSearch('');
                setType(undefined);
                setStatus(undefined);
                setPage(1);
              }}
              block
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="premium-card">
        <Table
          dataSource={logData?.data || []}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 15,
            total: logData?.pagination?.total || 0,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};



export default NotificationCenterPage;
