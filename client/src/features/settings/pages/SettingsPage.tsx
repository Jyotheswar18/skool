import React from 'react';
import { Form, Input, Button, Card, Row, Col, Select, Switch, InputNumber, App, Spin, Space } from 'antd';
import { SettingOutlined, BankOutlined, DollarOutlined, BellOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';

const { Option } = Select;

export const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

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
        sendTime: values.attendanceAlertTime,
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
        attendanceAlertTime: config.attendanceAlert.sendTime,
      });
    }
  }, [config, form]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading settings..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>School Settings</h2>
        <span style={{ color: '#475569' }}>Configure school profiles, sections, SMS API configs, and billing scheduler parameters</span>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: '#4f46e5' }} />
                  <span>General Profile</span>
                </Space>
              }
              className="premium-card"
              style={{ marginBottom: 24 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="schoolName"
                    label="School Name"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="Enter school name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="academicYear"
                    label="Active Academic Year"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="e.g. 2026-27" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="schoolLogo" label="School Logo URL">
                <Input placeholder="https://example.com/logo.png" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="classes"
                    label="Active Classes (comma-separated)"
                    rules={[{ required: true, message: 'Required' }]}
                    extra="Enter classes list separated by comma. e.g. 1, 2, 3, 4, 5"
                  >
                    <Input placeholder="e.g. 1, 2, 3" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="sections"
                    label="Active Sections (comma-separated)"
                    rules={[{ required: true, message: 'Required' }]}
                    extra="Enter sections list. e.g. A, B, C"
                  >
                    <Input placeholder="e.g. A, B" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <DollarOutlined style={{ color: '#10b981' }} />
                  <span>Fee Reminders</span>
                </Space>
              }
              className="premium-card"
              style={{ marginBottom: 24 }}
            >
              <Form.Item name="feeReminderDays" label="Due Date Warning Buffer (Days)">
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="feeReminderOnDue" label="Send Reminder on Due Date" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>

              <Form.Item name="feeReminderOverdueFreq" label="Overdue Warnings Frequency">
                <Select>
                  <Option value="daily">Daily Warnings</Option>
                  <Option value="weekly">Weekly Summary</Option>
                </Select>
              </Form.Item>
            </Card>

            <Card title="Attendance Warnings" className="premium-card" style={{ marginBottom: 24 }}>
              <Form.Item name="attendanceAlertEnabled" label="Enable Absentee Alert Broadcast" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>

              <Form.Item
                name="attendanceAlertTime"
                label="Daily Execution Cutoff Time (24h)"
                extra="Time at which absentee alerts are compiled daily."
              >
                <Input placeholder="e.g. 10:00" />
              </Form.Item>
            </Card>

            <Card className="premium-card">
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending} block>
                Save Settings Configuration
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SettingsPage;
