import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, App, Spin, Empty, Progress, Drawer, Input, Select, Modal } from 'antd';
import { DollarOutlined, AlertOutlined, CheckCircleOutlined, BellOutlined, SearchOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import dayjs from 'dayjs';

const { Option } = Select;

export const FeeOverviewPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters State
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Fetch school config for class/section dropdown lists
  const { data: configData } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch general collections statistics
  const { data: feeReport, isLoading: loadingReport } = useQuery({
    queryKey: ['feeReport'],
    queryFn: async () => {
      const res = await apiClient.get('/fees/report');
      return res.data.data;
    },
  });

  // Fetch all students fee board
  const { data: studentList, isLoading: loadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['feeStudents', selectedClass, selectedSection, searchText],
    queryFn: async () => {
      const res = await apiClient.get('/fees/students', {
        params: {
          class: selectedClass,
          section: selectedSection,
          search: searchText || undefined,
        },
      });
      return res.data.data;
    },
  });

  // Fetch specific student's installments
  const { data: installmentsList, isLoading: loadingInstallments, refetch: refetchInstallments } = useQuery({
    queryKey: ['studentInstallments', selectedStudent?._id],
    queryFn: async () => {
      if (!selectedStudent?._id) return [];
      const res = await apiClient.get(`/fees/students/${selectedStudent._id}/installments`);
      return res.data.data;
    },
    enabled: !!selectedStudent?._id,
  });

  // Pay installment mutation
  const payInstallmentMutation = useMutation({
    mutationFn: async ({ installmentId, notes }: { installmentId: string; notes?: string }) => {
      return apiClient.put(`/fees/installments/${installmentId}/pay`, { notes });
    },
    onSuccess: () => {
      message.success('Payment recorded successfully');
      refetchInstallments();
      refetchStudents();
      queryClient.invalidateQueries({ queryKey: ['feeReport'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Payment recording failed');
    },
  });

  // Send WhatsApp reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (installmentId: string) => {
      return apiClient.post(`/fees/installments/${installmentId}/remind`);
    },
    onSuccess: (res: any) => {
      message.success(res.data?.data?.message || 'WhatsApp reminder sent successfully');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to send WhatsApp reminder');
    },
  });

  const handlePayInstallment = (inst: any) => {
    let paymentNotes = '';
    Modal.confirm({
      title: `Record Payment - Inst #${inst.installmentNumber}`,
      content: (
        <div style={{ marginTop: 8 }}>
          <p>Confirm receiving ₹{inst.amount.toLocaleString('en-IN')} for {selectedStudent?.name}.</p>
          <Input 
            placeholder="Payment notes / reference (optional)" 
            onChange={(e) => { paymentNotes = e.target.value; }}
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Confirm Payment',
      cancelText: 'Cancel',
      onOk: () => {
        payInstallmentMutation.mutate({ installmentId: inst._id, notes: paymentNotes });
      }
    });
  };

  const clearFilters = () => {
    setSelectedClass(undefined);
    setSelectedSection(undefined);
    setSearchText('');
  };

  const loading = loadingReport || loadingStudents;

  if (loading && !studentList) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading fee board..." />
      </div>
    );
  }

  const summary = feeReport?.summary || { totalExpected: 0, collected: 0, pending: 0, overdue: 0 };
  const classWise = feeReport?.classWise || [];

  const collectionPercent =
    summary.totalExpected > 0 ? Math.round((summary.collected / summary.totalExpected) * 100) : 0;

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return <Tag color="success">Fully Paid</Tag>;
      case 'partial':
        return <Tag color="processing">Partial</Tag>;
      case 'overdue':
        return <Tag color="error">Overdue</Tag>;
      default:
        return <Tag color="default">Unpaid</Tag>;
    }
  };

  const studentColumns = [
    {
      title: 'Adm No.',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500, color: '#1e293b' }}>{text}</span>,
    },
    {
      title: 'Class',
      key: 'classSection',
      render: (_: any, record: any) => `Class ${record.class}-${record.section}`,
    },
    {
      title: 'Total Fee',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (val: number) => <span style={{ color: '#10b981', fontWeight: 500 }}>₹{val.toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Pending',
      dataIndex: 'pendingAmount',
      key: 'pendingAmount',
      render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    {
      title: 'Status',
      dataIndex: 'feeStatus',
      key: 'feeStatus',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Next Installment',
      dataIndex: 'nextInstallment',
      key: 'nextInstallment',
      render: (next: any) => {
        if (!next) return <span style={{ color: '#94a3b8', fontSize: 13 }}>None</span>;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>₹{next.amount.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Due: {dayjs(next.dueDate).format('DD MMM YYYY')}</span>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(record);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Fee Board</h2>
          <span style={{ color: '#475569' }}>Track academic collections, payments schedules, and reminders</span>
        </div>
        <Button 
          type="default" 
          icon={<SyncOutlined />} 
          onClick={() => {
            refetchStudents();
            queryClient.invalidateQueries({ queryKey: ['feeReport'] });
          }}
        >
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card" style={{ height: '100%' }}>
            <Statistic
              title="Total Expected Collection"
              value={summary.totalExpected}
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              prefix={<DollarOutlined style={{ color: '#4f46e5', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card" style={{ height: '100%' }}>
            <Statistic
              title="Total Fees Collected"
              value={summary.collected}
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              prefix={<CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={collectionPercent} size="small" strokeColor="#10b981" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card" style={{ borderLeft: '4px solid #f59e0b', height: '100%' }}>
            <Statistic
              title="Pending Amount"
              value={summary.pending}
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="premium-card" style={{ borderLeft: '4px solid #ef4444', height: '100%' }}>
            <Statistic
              title="Overdue Amount"
              value={summary.overdue}
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              valueStyle={{ color: '#ef4444' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }} className="premium-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search student by name or adm number..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              value={selectedClass}
              onChange={setSelectedClass}
              allowClear
            >
              {configData?.classes.map((c: string) => (
                <Option key={c} value={c}>Class {c}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Section"
              value={selectedSection}
              onChange={setSelectedSection}
              allowClear
            >
              {configData?.sections.map((s: string) => (
                <Option key={s} value={s}>Section {s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Grid: Student fee list + Class-wise collections summary */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={17}>
          <Card title="Student Fee Ledger" className="premium-card">
            <Table
              dataSource={studentList || []}
              columns={studentColumns}
              rowKey="_id"
              pagination={{ pageSize: 8 }}
              loading={loadingStudents}
              onRow={(record) => ({
                onClick: () => setSelectedStudent(record),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>

        <Col xs={24} lg={7}>
          <Card title="Class-Wise Summary" className="premium-card">
            {classWise.length === 0 ? (
              <Empty description="No collections recorded yet" />
            ) : (
              <Table
                dataSource={classWise}
                columns={[
                  {
                    title: 'Class',
                    dataIndex: 'class',
                    key: 'class',
                    render: (text) => <strong>Class {text}</strong>,
                  },
                  {
                    title: 'Collected',
                    dataIndex: 'collected',
                    key: 'collected',
                    render: (val) => `₹${val.toLocaleString('en-IN')}`,
                  },
                ]}
                rowKey="class"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Student Details Drawer */}
      <Drawer
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Student Fee Structure Detail</span>}
        placement="right"
        width={650}
        onClose={() => setSelectedStudent(null)}
        open={!!selectedStudent}
      >
        {selectedStudent && (
          <div>
            {/* Header info */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Student Name</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{selectedStudent.name}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Admission Number</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{selectedStudent.admissionNumber}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Class / Section</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Class {selectedStudent.class}-{selectedStudent.section}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Parent Mobile (WhatsApp)</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{selectedStudent.parentMobile}</div>
                </Col>
              </Row>
            </div>

            {/* Aggregated Totals and Progress Bar */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 600 }}>Fee Aggregates</h4>
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Card size="small" bodyStyle={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Total Fee</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>₹{selectedStudent.totalFee.toLocaleString('en-IN')}</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bodyStyle={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Paid</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#10b981' }}>₹{selectedStudent.paidAmount.toLocaleString('en-IN')}</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bodyStyle={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Pending / Overdue</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: selectedStudent.overdueAmount > 0 ? '#ef4444' : '#f59e0b' }}>
                      ₹{(selectedStudent.pendingAmount + selectedStudent.overdueAmount).toLocaleString('en-IN')}
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Overall Collection Progress:</span>
                  <strong>{Math.round((selectedStudent.paidAmount / selectedStudent.totalFee) * 100)}%</strong>
                </div>
                <Progress 
                  percent={Math.round((selectedStudent.paidAmount / selectedStudent.totalFee) * 100)} 
                  showInfo={false} 
                  strokeColor="#10b981"
                />
              </div>
            </div>

            {/* Installments Table */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 600 }}>Installment Schedule</h4>
            {loadingInstallments ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}><Spin description="Loading installments..." /></div>
            ) : installmentsList?.length === 0 ? (
              <Empty description="No installments generated for this student." />
            ) : (
              <Table
                dataSource={installmentsList || []}
                rowKey="_id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Inst.',
                    dataIndex: 'installmentNumber',
                    key: 'installmentNumber',
                    width: 60,
                    render: (num: any) => `#${num}`,
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (val: any) => `₹${val.toLocaleString('en-IN')}`,
                  },
                  {
                    title: 'Due Date',
                    dataIndex: 'dueDate',
                    key: 'dueDate',
                    render: (date: any) => dayjs(date).format('DD MMM YYYY'),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: any) => {
                      if (status === 'paid') return <Tag color="success">Paid</Tag>;
                      if (status === 'overdue') return <Tag color="error">Overdue</Tag>;
                      return <Tag color="warning">Pending</Tag>;
                    },
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record: any) => {
                      if (record.status === 'paid') {
                        return (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            <div>Paid: {record.paidDate ? dayjs(record.paidDate).format('DD MMM YY') : 'N/A'}</div>
                            {record.notes && <div style={{ fontStyle: 'italic' }}>"{record.notes}"</div>}
                          </div>
                        );
                      }
                      return (
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handlePayInstallment(record)}
                            loading={payInstallmentMutation.isPending}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="small"
                            icon={<BellOutlined />}
                            onClick={() => sendReminderMutation.mutate(record._id)}
                            loading={sendReminderMutation.isPending && sendReminderMutation.variables === record._id}
                          >
                            Remind
                          </Button>
                        </Space>
                      );
                    },
                  },
                ]}
              />
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FeeOverviewPage;
