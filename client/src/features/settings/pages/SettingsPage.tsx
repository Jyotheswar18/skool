import React from 'react';
import { Form, Input, Button, Card, Row, Col, Select, Switch, InputNumber, App, Spin, Space, Divider, TimePicker } from 'antd';
import { SettingOutlined, BankOutlined, DollarOutlined, BellOutlined, PictureOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { apiClient } from '../../../api/axios';

const { Option } = Select;

export const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // Watch values for real-time interactivity
  const logoUrl = Form.useWatch('schoolLogo', form);
  const attendanceAlertEnabled = Form.useWatch('attendanceAlertEnabled', form);

  // Fetch school configuration singleton
  const { data: config, isLoading } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Update configuration mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.put('/config', values);
    },
    onSuccess: () => {
      message.success('School configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['schoolConfig'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to save config');
    },
  });

  const onFinish = (values: any) => {
    // Structure values to match SchoolConfig schema
    const payload = {
      schoolName: values.schoolName,
      schoolLogo: values.schoolLogo,
      academicYear: values.academicYear,
      classes: values.classes.split(',').map((c: string) => c.trim()),
      sections: values.sections.split(',').map((s: string) => s.trim().toUpperCase()),

      sms: {
        provider: values.smsProvider || config?.sms?.provider || 'mock',
        apiKey: values.smsApiKey || config?.sms?.apiKey || '',
        apiUrl: values.smsApiUrl || config?.sms?.apiUrl || '',
        senderNumber: values.smsSenderNumber || config?.sms?.senderNumber || '',
        enabled: values.smsEnabled !== undefined ? values.smsEnabled : !!config?.sms?.enabled,
      },
      feeReminder: {
        daysBeforeDue: values.feeReminderDays,
        sendOnDueDate: values.feeReminderOnDue,
        overdueFrequency: values.feeReminderOverdueFreq,
      },
      attendanceAlert: {
        enabled: values.attendanceAlertEnabled,
        sendTime: values.attendanceAlertTime ? values.attendanceAlertTime.format('HH:mm') : '10:00',
      },
    };

    updateMutation.mutate(payload);
  };

  // Populate form values once loaded
  React.useEffect(() => {
    if (config) {
      form.setFieldsValue({
        schoolName: config.schoolName,
        schoolLogo: config.schoolLogo,
        academicYear: config.academicYear,
        classes: config.classes.join(', '),
        sections: config.sections.join(', '),

        smsProvider: config.sms?.provider || 'mock',
        smsApiKey: config.sms?.apiKey || '',
        smsApiUrl: config.sms?.apiUrl || '',
        smsSenderNumber: config.sms?.senderNumber || '',
        smsEnabled: !!config.sms?.enabled,
        feeReminderDays: config.feeReminder.daysBeforeDue,
        feeReminderOnDue: config.feeReminder.sendOnDueDate,
        feeReminderOverdueFreq: config.feeReminder.overdueFrequency,
        attendanceAlertEnabled: config.attendanceAlert.enabled,
        attendanceAlertTime: config.attendanceAlert.sendTime ? dayjs(config.attendanceAlert.sendTime, 'HH:mm') : undefined,
      });
    }
  }, [config, form]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading settings..." />
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
      {/* Top Header Section with Save Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>School Settings</h2>
          <span style={{ color: '#64748b', fontSize: 14 }}>Configure school profile details, academic terms, and notification automations.</span>
        </div>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={updateMutation.isPending}
          icon={<SettingOutlined />}
          style={{
            height: 44,
            borderRadius: 8,
            fontWeight: 600,
            padding: '0 24px',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.15)'
          }}
        >
          Save Configuration
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Side: General Profile Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BankOutlined style={{ color: '#4f46e5' }} />
                <span style={{ fontWeight: 600 }}>General Profile</span>
              </Space>
            }
            className="premium-card"
            style={{ height: '100%' }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={16}>
                <Form.Item
                  name="schoolName"
                  label="School Name"
                  rules={[{ required: true, message: 'School name is required' }]}
                >
                  <Input placeholder="Enter school name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="academicYear"
                  label="Active Academic Year"
                  rules={[{ required: true, message: 'Academic year is required' }]}
                >
                  <Input placeholder="e.g. 2026-27" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="schoolLogo" label="School Logo URL">
              <Input placeholder="https://example.com/logo.png" />
            </Form.Item>

            {/* Real-time logo preview */}
            {logoUrl && (
              <div style={{ 
                marginTop: -12, 
                marginBottom: 20, 
                padding: 12, 
                background: '#f8fafc', 
                borderRadius: 8, 
                border: '1px dashed #cbd5e1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12
              }}>
                <img 
                  src={logoUrl} 
                  alt="School Logo Preview" 
                  style={{ maxHeight: 40, maxWidth: 100, objectFit: 'contain', borderRadius: 4 }} 
                  onError={(e) => {
                    (e.target as HTMLElement).parentElement!.style.display = 'none';
                  }}
                />
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  <PictureOutlined style={{ marginRight: 4 }} />
                  Logo Live Preview
                </span>
              </div>
            )}

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="classes"
                  label="Active Classes"
                  rules={[{ required: true, message: 'Active classes are required' }]}
                  extra="Comma-separated classes. e.g. 1, 2, 3, 4, 5"
                >
                  <Input placeholder="e.g. 1, 2, 3" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="sections"
                  label="Active Sections"
                  rules={[{ required: true, message: 'Active sections are required' }]}
                  extra="Comma-separated sections. e.g. A, B, C"
                >
                  <Input placeholder="e.g. A, B" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Side: Notification & Automation Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: '#10b981' }} />
                <span style={{ fontWeight: 600 }}>Automation & Alerts</span>
              </Space>
            }
            className="premium-card"
            style={{ height: '100%' }}
          >
            {/* Subsection 1: Fee Reminders */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <DollarOutlined style={{ color: '#10b981', fontSize: 16 }} />
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>Fee Reminders</span>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="feeReminderDays" label="Due Date Warning Buffer">
                  <InputNumber min={1} max={30} addonAfter="Days before" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="feeReminderOverdueFreq" label="Overdue Warnings Frequency">
                  <Select>
                    <Option value="daily">Daily Warnings</Option>
                    <Option value="weekly">Weekly Summary</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16, 
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#334155', fontSize: 14 }}>Send Reminder on Due Date</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Dispatch alerts to parents on the actual due date.</div>
              </div>
              <Form.Item name="feeReminderOnDue" valuePropName="checked" noStyle>
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* Subsection 2: Attendance Alerts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BellOutlined style={{ color: '#ef4444', fontSize: 16 }} />
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>Attendance Broadcasts</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 20, 
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#334155', fontSize: 14 }}>Enable Absentee Alerts</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Automatically notify parents if their child is marked absent.</div>
              </div>
              <Form.Item name="attendanceAlertEnabled" valuePropName="checked" noStyle>
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </div>

            <Form.Item
              name="attendanceAlertTime"
              label="Daily Execution Cutoff Time"
              extra="Time at which absentee notifications are compiled and broadcasted."
            >
              <TimePicker 
                format="HH:mm" 
                style={{ width: '100%' }} 
                disabled={!attendanceAlertEnabled} 
                placeholder="Select daily compile time"
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default SettingsPage;

