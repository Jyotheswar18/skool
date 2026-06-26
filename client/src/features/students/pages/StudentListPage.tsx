import React, { useState } from 'react';
import { Table, Card, Button, Input, Select, Space, Tag, Modal, App, Row, Col } from 'antd';
import { UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Student } from '../../../types/common.types';

const { Option } = Select;

export const StudentListPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>('active');

  // Fetch school config for class/section filter dropdowns
  const { data: configData } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', page, search, selectedClass, selectedSection, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        sortBy: 'name',
        order: 'asc',
      });
      if (search) params.append('search', search);
      if (selectedClass) params.append('class', selectedClass);
      if (selectedSection) params.append('section', selectedSection);
      if (status) params.append('status', status);

      const res = await apiClient.get(`/students?${params.toString()}`);
      return res.data;
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/students/${id}`);
    },
    onSuccess: () => {
      message.success('Student record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to delete student');
    },
  });

  const handleDelete = (record: Student) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this student?',
      content: `This will soft-delete ${record.name} and clear any unpaid pending/overdue installments.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(record._id),
    });
  };

  const columns = [
    {
      title: 'Adm No.',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <a onClick={() => navigate(`/admin/students/${record._id}`)}>{text}</a>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      render: (text: string, record: Student) => `Class ${text}-${record.section}`,
    },
    {
      title: 'Parent Name',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: 'Parent Contact',
      dataIndex: 'parentMobile',
      key: 'parentMobile',
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
      render: (_: any, record: Student) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/students/${record._id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/students/edit/${record._id}`)}
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
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Students</h2>
          <span style={{ color: '#475569' }}>Manage admissions, update profiles, and view records</span>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          onClick={() => navigate('/admin/students/new')}
        >
          Add Student
        </Button>
      </div>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name or admission number..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter Class"
              value={selectedClass}
              onChange={setSelectedClass}
              allowClear
            >
              {configData?.classes.map((c: string) => (
                <Option key={c} value={c}>
                  Class {c}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter Section"
              value={selectedSection}
              onChange={setSelectedSection}
              allowClear
            >
              {configData?.sections.map((s: string) => (
                <Option key={s} value={s}>
                  Section {s}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
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
          <Col xs={24} md={4}>
            <Button
              onClick={() => {
                setSearch('');
                setSelectedClass(undefined);
                setSelectedSection(undefined);
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
          dataSource={studentsData?.data || []}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 15,
            total: studentsData?.pagination?.total || 0,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default StudentListPage;
