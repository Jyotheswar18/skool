import React, { useState } from 'react';
import { Table, Card, Button, Input, Select, Space, Tag, Modal, Form, App, Row, Col, Typography } from 'antd';
import { UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { User } from '../../../types/common.types';

const { Option } = Select;

export const TeacherListPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>('active');

  // Password reset modal states
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [resetForm] = Form.useForm();

  // Fetch teachers
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        sortBy: 'name',
        order: 'asc',
      });
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const res = await apiClient.get(`/teachers?${params.toString()}`);
      return res.data;
    },
  });

  // Delete teacher account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      message.success('Teacher account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to delete teacher account');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      return apiClient.put(`/teachers/${id}/reset-password`, {
        newPassword: values.password,
      });
    },
    onSuccess: () => {
      message.success('Password reset successfully');
      setResetModalVisible(false);
      resetForm.resetFields();
      setSelectedTeacher(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to reset password');
    },
  });

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this teacher account?',
      content: `This will remove ${record.name} from the database.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(record._id),
    });
  };

  const handleOpenResetModal = (record: User) => {
    setSelectedTeacher(record);
    setResetModalVisible(true);
  };

  const handleResetPassword = (values: any) => {
    if (!selectedTeacher) return;
    resetPasswordMutation.mutate({ id: selectedTeacher._id, values });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text?: string) => text || '-',
    },
    {
      title: 'Assigned Scope',
      key: 'scope',
      render: (_: any, record: User) => (
        <Space size={2} wrap>
          {record.assignedClasses.map((c) =>
            record.assignedSections.map((s) => (
              <Tag color="cyan" key={`${c}-${s}`}>
                {c}-{s}
              </Tag>
            ))
          )}
          {record.assignedClasses.length === 0 && <Text type="secondary">None</Text>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (
        <Tag color={val === 'active' ? 'green' : 'red'}>{val.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<LockOutlined />}
            onClick={() => handleOpenResetModal(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/teachers/edit/${record._id}`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Teachers</h2>
          <span style={{ color: '#475569' }}>Manage teacher accounts, class scopes, and credentials</span>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          onClick={() => navigate('/admin/teachers/new')}
        >
          Add Teacher
        </Button>
      </div>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12}>
            <Input
              placeholder="Search by name, email, or contact number..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Button
              onClick={() => {
                setSearch('');
                setStatus('active');
                setPage(1);
              }}
              block
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="premium-card">
        <Table
          dataSource={teachersData?.data || []}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 15,
            total: teachersData?.pagination?.total || 0,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Password Reset Modal */}
      <Modal
        title={`Reset Password for ${selectedTeacher?.name}`}
        open={resetModalVisible}
        onCancel={() => {
          setResetModalVisible(false);
          resetForm.resetFields();
        }}
        footer={null}
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword} size="large">
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password!' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (value.length < 8) {
                    return Promise.reject(new Error('Password must be at least 8 characters long'));
                  }
                  if (!/[a-z]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least one lowercase letter'));
                  }
                  if (!/[A-Z]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least one uppercase letter'));
                  }
                  if (!/[0-9]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least one number'));
                  }
                  if (!/[^a-zA-Z0-9]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least one special character'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setResetModalVisible(false);
                  resetForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={resetPasswordMutation.isPending}>
                Reset Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const { Text } = Typography;
export default TeacherListPage;
