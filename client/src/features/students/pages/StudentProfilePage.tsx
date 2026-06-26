import React, { useState } from 'react';
import { Row, Col, Card, Typography, Descriptions, Tag, Table, Progress, Button, Space, Modal, Input, App, Spin } from 'antd';
import { UserOutlined, ContactsOutlined, DollarOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import { Installment } from '../../../types/common.types';

const { Title, Text } = Typography;

export const StudentProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Fetch student profile details
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['studentProfile', id],
    queryFn: async () => {
      const res = await apiClient.get(`/students/${id}`);
      return res.data.data;
    },
  });

  // Record payment mutation
  const payMutation = useMutation({
    mutationFn: async ({ instId, notes }: { instId: string; notes: string }) => {
      return apiClient.put(`/fees/installments/${instId}/pay`, { notes });
    },
    onSuccess: () => {
      message.success('Payment recorded successfully');
      setPayModalVisible(false);
      setPaymentNotes('');
      setSelectedInstallment(null);
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to record payment');
    },
  });

  const handleOpenPayModal = (inst: Installment) => {
    setSelectedInstallment(inst);
    setPayModalVisible(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInstallment) return;
    payMutation.mutate({ instId: selectedInstallment._id, notes: paymentNotes });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading student profile..." />
      </div>
    );
  }

  if (!profileData) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px 0' }}>
        <Title level={4}>Student Profile Not Found</Title>
        <Button type="primary" onClick={() => navigate('/admin/students')}>
          Back to Students List
        </Button>
      </Card>
    );
  }

  const { student, installments, attendanceSummary } = profileData;

  const installmentColumns = [
    {
      title: 'No.',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dateStr: string) => new Date(dateStr).toLocaleDateString(),
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'paid') color = 'green';
        if (status === 'overdue') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Paid Date',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (dateStr?: string) => (dateStr ? new Date(dateStr).toLocaleDateString() : '-'),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes?: string) => notes || '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Installment) => (
        record.status !== 'paid' && (
          <Button
            type="primary"
            size="small"
            ghost
            icon={<CheckCircleOutlined />}
            onClick={() => handleOpenPayModal(record)}
          >
            Mark Paid
          </Button>
        )
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          {student.name} — Profile Card
        </Title>
        <Text type="secondary">Admission No: {student.admissionNumber}</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#4f46e5' }} />
                <span>Student Details</span>
              </Space>
            }
            className="premium-card"
            style={{ marginBottom: 24 }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Admission Number">{student.admissionNumber}</Descriptions.Item>
              <Descriptions.Item label="Student Status">
                <Tag color={student.status === 'active' ? 'green' : 'red'}>
                  {student.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Class & Section">
                Class {student.class}-{student.section}
              </Descriptions.Item>
              <Descriptions.Item label="Joining Date">
                {new Date(student.joiningDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {student.address || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <Space>
                <ContactsOutlined style={{ color: '#0ea5e9' }} />
                <span>Parent & Contact Details</span>
              </Space>
            }
            className="premium-card"
            style={{ marginBottom: 24 }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Parent / Guardian Name">{student.parentName}</Descriptions.Item>
              <Descriptions.Item label="WhatsApp Contact">{student.parentMobile}</Descriptions.Item>
              <Descriptions.Item label="Alternate Number">{student.alternateMobile || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Side panels (Attendance Gauge) */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#10b981' }} />
                <span>Attendance Summary</span>
              </Space>
            }
            className="premium-card"
            style={{ marginBottom: 24, textAlign: 'center' }}
          >
            <Progress
              type="dashboard"
              percent={attendanceSummary.percentage}
              strokeColor={{
                '0%': '#ef4444',
                '50%': '#f59e0b',
                '100%': '#10b981',
              }}
              style={{ marginBottom: 16 }}
            />
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Total Classes">{attendanceSummary.total}</Descriptions.Item>
              <Descriptions.Item label="Present">{attendanceSummary.present}</Descriptions.Item>
              <Descriptions.Item label="Absent">{attendanceSummary.absent}</Descriptions.Item>
              <Descriptions.Item label="Late">{attendanceSummary.late}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Fee Installments Section */}
      <Card
        title={
          <Space>
            <DollarOutlined style={{ color: '#6366f1' }} />
            <span>Installment Schedule Details</span>
          </Space>
        }
        className="premium-card"
      >
        <Table
          dataSource={installments}
          columns={installmentColumns}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        title="Record Payment"
        open={payModalVisible}
        onOk={handleRecordPayment}
        onCancel={() => setPayModalVisible(false)}
        confirmLoading={payMutation.isPending}
        okText="Record Payment"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            You are marking <strong>Installment #{selectedInstallment?.installmentNumber}</strong> as{' '}
            <Tag color="green">PAID</Tag> for {student.name}.
          </Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text strong>Installment Amount: ₹{selectedInstallment?.amount}</Text>
        </div>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Optional Payment Notes (e.g. Transaction Reference, Bank Details):</Text>
          <Input.TextArea
            rows={3}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Enter payment notes..."
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfilePage;
