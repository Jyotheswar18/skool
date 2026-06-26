import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, App, Spin, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';

const { Option } = Select;

export const TeacherFormPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form] = Form.useForm();
  const [fetchingTeacher, setFetchingTeacher] = useState(false);

  // Fetch school config for class/section selections
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch teacher details if edit mode
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!isEditMode) return;
      setFetchingTeacher(true);
      try {
        const res = await apiClient.get(`/teachers/${id}`);
        const teacher = res.data.data;
        form.setFieldsValue({
          name: teacher.name,
          email: teacher.email,
          mobile: teacher.mobile,
          assignedClasses: teacher.assignedClasses,
          assignedSections: teacher.assignedSections,
          status: teacher.status,
        });
      } catch (error) {
        console.error('Failed to load teacher details:', error);
        message.error('Failed to load teacher details');
        navigate('/admin/teachers');
      } finally {
        setFetchingTeacher(false);
      }
    };

    fetchTeacher();
  }, [id, isEditMode, form, navigate]);

  // Create teacher mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.post('/teachers', values);
    },
    onSuccess: () => {
      message.success('Teacher account created successfully');
      navigate('/admin/teachers');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to create teacher account');
    },
  });

  // Update teacher mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.put(`/teachers/${id}`, values);
    },
    onSuccess: () => {
      message.success('Teacher details updated successfully');
      navigate('/admin/teachers');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to update teacher');
    },
  });

  const onFinish = (values: any) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const loading = loadingConfig || fetchingTeacher;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading data..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
          {isEditMode ? 'Edit Teacher Details' : 'Create Teacher Account'}
        </h2>
        <span style={{ color: '#475569' }}>
          {isEditMode ? 'Modify teacher credentials and class scope' : 'Register a new teacher log-in and assign classes'}
        </span>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark size="large">
        <Row gutter={24}>
          <Col xs={24}>
            <Card title="Account Profile Details" className="premium-card" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Teacher Full Name"
                    rules={[{ required: true, message: 'Name is required' }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email Address (Login ID)"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Must be a valid email' },
                    ]}
                  >
                    <Input placeholder="name@school.com" disabled={isEditMode} />
                  </Form.Item>
                </Col>
              </Row>

              {!isEditMode && (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Password is required' },
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
                  <Input.Password placeholder="Create login password" />
                </Form.Item>
              )}

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile Contact Number"
                    rules={[{ pattern: /^[0-9]{10}$/, message: 'Must be a 10-digit number' }]}
                  >
                    <Input placeholder="Optional 10-digit number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Status is required' }]}
                    initialValue="active"
                  >
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Class & Section Assignment Scope" className="premium-card">
              <div style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>
                💡 <strong>Important:</strong> Teachers can only view profiles, mark attendance, and see summaries for
                students in their assigned class and section scopes.
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="assignedClasses"
                    label="Assigned Classes"
                    rules={[{ required: true, message: 'Assign at least one class' }]}
                  >
                    <Select mode="multiple" placeholder="Select assigned classes" allowClear>
                      {configData?.classes.map((c: string) => (
                        <Option key={c} value={c}>
                          Class {c}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="assignedSections"
                    label="Assigned Sections"
                    rules={[{ required: true, message: 'Assign at least one section' }]}
                  >
                    <Select mode="multiple" placeholder="Select assigned sections" allowClear>
                      {configData?.sections.map((s: string) => (
                        <Option key={s} value={s}>
                          Section {s}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card className="premium-card">
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  block
                >
                  Save Record
                </Button>
                <Button onClick={() => navigate('/admin/teachers')} block>
                  ← Go Back
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default TeacherFormPage;
