import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, DatePicker, InputNumber, App, Spin, Space, Table } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { apiClient } from '../../../api/axios';

const { Option } = Select;

export const StudentFormPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form] = Form.useForm();
  const [fetchingStudent, setFetchingStudent] = useState(false);

  // Watch form values for dynamic installment preview
  const totalFee = Form.useWatch('totalFee', form);
  const numberOfInstallments = Form.useWatch('numberOfInstallments', form);
  const joiningDate = Form.useWatch('joiningDate', form);
  const feeEndDate = Form.useWatch('feeEndDate', form);

  // Fetch school config for class/section lists
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch student details if in edit mode
  useEffect(() => {
    const fetchStudent = async () => {
      if (!isEditMode) return;
      setFetchingStudent(true);
      try {
        const res = await apiClient.get(`/students/${id}`);
        const student = res.data.data.student;
        form.setFieldsValue({
          name: student.name,
          admissionNumber: student.admissionNumber,
          class: student.class,
          section: student.section,
          parentName: student.parentName,
          parentMobile: student.parentMobile,
          alternateMobile: student.alternateMobile,
          address: student.address,
          joiningDate: dayjs(student.joiningDate),
          totalFee: student.totalFee,
          numberOfInstallments: student.numberOfInstallments,
          feeEndDate: student.feeEndDate ? dayjs(student.feeEndDate) : undefined,
          status: student.status,
        });
      } catch (error) {
        console.error('Failed to load student details:', error);
        message.error('Failed to load student details');
        navigate('/admin/students');
      } finally {
        setFetchingStudent(false);
      }
    };

    fetchStudent();
  }, [id, isEditMode, form, navigate]);

  // Create student mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.post('/students', values);
    },
    onSuccess: () => {
      message.success('Student onboarding successful. WhatsApp welcome message queued.');
      navigate('/admin/students');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to create student');
    },
  });

  // Update student mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.put(`/students/${id}`, values);
    },
    onSuccess: () => {
      message.success('Student details updated successfully');
      navigate('/admin/students');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to update student');
    },
  });

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      joiningDate: values.joiningDate.format('YYYY-MM-DD'),
      feeEndDate: values.feeEndDate ? values.feeEndDate.format('YYYY-MM-DD') : undefined,
    };

    if (isEditMode) {
      updateMutation.mutate(formattedValues);
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  const loading = loadingConfig || fetchingStudent;

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
          {isEditMode ? 'Edit Student Details' : 'Onboard New Student'}
        </h2>
        <span style={{ color: '#475569' }}>
          {isEditMode ? 'Update child profile details' : 'Register a new student and generate installment plans'}
        </span>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark size="large">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Student Information" className="premium-card" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Student Full Name"
                    rules={[{ required: true, message: 'Student name is required' }]}
                  >
                    <Input placeholder="Enter student's name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="admissionNumber"
                    label="Admission Number"
                    rules={[{ required: true, message: 'Admission number is required' }]}
                  >
                    <Input placeholder="Enter admission number" disabled={isEditMode} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    name="class"
                    label="Class"
                    rules={[{ required: true, message: 'Class is required' }]}
                  >
                    <Select placeholder="Select Class">
                      {configData?.classes.map((c: string) => (
                        <Option key={c} value={c}>
                          Class {c}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    name="section"
                    label="Section"
                    rules={[{ required: true, message: 'Section is required' }]}
                  >
                    <Select placeholder="Select Section">
                      {configData?.sections.map((s: string) => (
                        <Option key={s} value={s}>
                          Section {s}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="joiningDate"
                    label="Joining Date"
                    rules={[{ required: true, message: 'Joining date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select date" />
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

            <Card title="Parent & Contact Details" className="premium-card" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="parentName"
                    label="Parent / Guardian Name"
                    rules={[{ required: true, message: 'Parent name is required' }]}
                  >
                    <Input placeholder="Enter parent's name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="parentMobile"
                    label="Parent Mobile Number (WhatsApp)"
                    rules={[
                      { required: true, message: 'WhatsApp mobile number is required' },
                      { pattern: /^[0-9]{10}$/, message: 'Must be a valid 10-digit number' },
                    ]}
                  >
                    <Input placeholder="10-digit mobile number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="alternateMobile"
                    label="Alternate Mobile Number"
                    rules={[{ pattern: /^[0-9]{10}$/, message: 'Must be a valid 10-digit number' }]}
                  >
                    <Input placeholder="Optional alternate number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="address" label="Residential Address">
                    <Input.TextArea placeholder="Enter complete address" rows={2} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Fee Plan Structure"
              className="premium-card"
              style={{ marginBottom: 24, borderTop: '4px solid #4f46e5' }}
            >
              <Form.Item
                name="totalFee"
                label="Total Course / Annual Fee (₹)"
                rules={[{ required: true, message: 'Total fee is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="e.g. 60000"
                  disabled={isEditMode}
                />
              </Form.Item>

              <Form.Item
                name="numberOfInstallments"
                label="Number of Installments"
                rules={[{ required: true, message: 'Required' }]}
                initialValue={3}
              >
                <Select disabled={isEditMode}>
                  <Option value={1}>1 Installment</Option>
                  <Option value={2}>2 Installments</Option>
                  <Option value={3}>3 Installments</Option>
                  <Option value={4}>4 Installments</Option>
                  <Option value={6}>6 Installments</Option>
                  <Option value={10}>10 Installments</Option>
                  <Option value={12}>12 Installments</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="feeEndDate"
                label="Fee End Date (Optional)"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select end date"
                  disabled={isEditMode}
                />
              </Form.Item>

              {!isEditMode && (
                <div style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>
                  📝 <strong>Note:</strong> Installment 1 will be due on the joining date. 
                  {feeEndDate ? (
                    <span> Subsequent installments will be evenly distributed up to the Fee End Date.</span>
                  ) : (
                    <span> Subsequent installments will be due at 30-day (1-month) intervals.</span>
                  )}
                </div>
              )}

              {(() => {
                if (isEditMode) return null;
                const previewData = (() => {
                  if (!totalFee || !numberOfInstallments || !joiningDate) return [];

                  const baseAmount = Math.floor(totalFee / numberOfInstallments);
                  const remainder = totalFee % numberOfInstallments;

                  const startDate = joiningDate.toDate ? joiningDate.toDate() : new Date(joiningDate);
                  const endDate = feeEndDate ? (feeEndDate.toDate ? feeEndDate.toDate() : new Date(feeEndDate)) : null;

                  let intervalMs = 0;
                  if (endDate) {
                    const totalDuration = endDate.getTime() - startDate.getTime();
                    intervalMs = numberOfInstallments > 1 ? totalDuration / (numberOfInstallments - 1) : 0;
                  }

                  const preview = [];
                  for (let i = 0; i < numberOfInstallments; i++) {
                    let dueDate: Date;
                    if (endDate && numberOfInstallments > 1) {
                      dueDate = new Date(startDate.getTime() + intervalMs * i);
                    } else if (endDate && numberOfInstallments === 1) {
                      dueDate = new Date(startDate);
                    } else {
                      dueDate = new Date(startDate);
                      dueDate.setMonth(startDate.getMonth() + i);
                    }

                    const amount = i === 0 ? baseAmount + remainder : baseAmount;
                    preview.push({
                      key: i + 1,
                      installmentNumber: i + 1,
                      amount,
                      dueDate: dayjs(dueDate).format('DD MMM YYYY'),
                    });
                  }
                  return preview;
                })();

                if (previewData.length === 0) return null;

                return (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14, color: '#1e293b' }}>Installment Preview:</div>
                    <Table
                      dataSource={previewData}
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: 'Inst. #',
                          dataIndex: 'installmentNumber',
                          key: 'installmentNumber',
                          width: 80,
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
                        },
                        {
                          title: 'Due Date',
                          dataIndex: 'dueDate',
                          key: 'dueDate',
                        },
                      ]}
                    />
                  </div>
                );
              })()}
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
                <Button onClick={() => navigate('/admin/students')} block>
                  Cancel
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default StudentFormPage;
