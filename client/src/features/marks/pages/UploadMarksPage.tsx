import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Select, InputNumber, Input, Button, Table, Typography, App, Spin, Empty, Space, Tag } from 'antd';
import { FormOutlined, BookOutlined, UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/hooks/useAuth';
import { apiClient } from '../../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentMarkRow {
  key: string;
  studentId: string;
  name: string;
  admissionNumber: string;
  marksObtained: number | null;
  comments: string;
}

export const UploadMarksPage: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentMarkRow[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [maxMarksValue, setMaxMarksValue] = useState<number>(100);

  // Default lists of exams and subjects
  const examList = ['Unit Test 1', 'Unit Test 2', 'Quarterly Exam', 'Half Yearly Exam', 'Annual Exam'];
  const subjectList = [
    'Mathematics',
    'Science',
    'General Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Science',
    'History & Civics',
    'Geography',
    'English',
    'English Grammar',
    'English Literature',
    'Hindi',
    'Sanskrit',
    'Computer Science',
  ];

  // Set default form values based on teacher's assignments
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        class: user.assignedClasses?.[0] || '',
        section: (user.assignedSections?.[0] || '').toUpperCase(),
        subject: subjectList[0],
        examName: examList[0],
        maxMarks: 100,
      });
    }
  }, [user, form]);

  const loadStudents = async (values: any) => {
    setLoading(true);
    setHasLoaded(false);
    setMaxMarksValue(values.maxMarks);
    
    try {
      const res = await apiClient.get('/marks/students', {
        params: {
          class: values.class,
          section: values.section,
          subject: values.subject,
          examName: values.examName,
        },
      });

      const fetchedStudents = res.data.data.students.map((s: any) => ({
        key: s.studentId,
        studentId: s.studentId,
        name: s.name,
        admissionNumber: s.admissionNumber,
        marksObtained: s.marksObtained,
        comments: s.comments || '',
      }));

      setStudents(fetchedStudents);
      setHasLoaded(true);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: number | null) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, marksObtained: value } : s))
    );
  };

  const handleCommentChange = (studentId: string, value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, comments: value } : s))
    );
  };

  const saveMarks = async () => {
    // Validate that all students have marks entered and they don't exceed max marks
    const invalidRecord = students.find(
      (s) => s.marksObtained === null || s.marksObtained < 0 || s.marksObtained > maxMarksValue
    );

    if (invalidRecord) {
      if (invalidRecord.marksObtained === null) {
        message.warning('Please input marks for all students before saving');
      } else {
        message.warning(`Marks for ${invalidRecord.name} must be between 0 and ${maxMarksValue}`);
      }
      return;
    }

    setSaving(true);
    const formValues = form.getFieldsValue();

    try {
      await apiClient.post('/marks/upload', {
        class: formValues.class,
        section: formValues.section,
        subject: formValues.subject,
        examName: formValues.examName,
        maxMarks: maxMarksValue,
        students: students.map((s) => ({
          studentId: s.studentId,
          marksObtained: s.marksObtained,
          comments: s.comments,
        })),
      });

      message.success('Marks uploaded and saved successfully!');
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to upload marks');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Roll No',
      key: 'rollNo',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          <UserOutlined style={{ marginRight: 8, color: '#0b4c33' }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Admission Number',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: `Marks (Max: ${maxMarksValue})`,
      key: 'marksObtained',
      width: 180,
      render: (_: any, record: StudentMarkRow) => (
        <InputNumber
          min={0}
          max={maxMarksValue}
          value={record.marksObtained ?? undefined}
          placeholder="Enter marks"
          onChange={(val) => handleMarkChange(record.studentId, val)}
          style={{ width: '100%', borderRadius: 6 }}
        />
      ),
    },
    {
      title: 'Remarks / Comments',
      key: 'comments',
      render: (_: any, record: StudentMarkRow) => (
        <Input
          placeholder="e.g. Excellent, Need to focus"
          value={record.comments}
          onChange={(e) => handleCommentChange(record.studentId, e.target.value)}
          style={{ borderRadius: 6 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Upload Marks</h2>
        <span style={{ color: '#475569' }}>Enter and upload academic test scores for your assigned classes</span>
      </div>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={loadStudents} size="large">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="class" label="Class" rules={[{ required: true, message: 'Select class' }]}>
                <Select style={{ borderRadius: 8 }}>
                  {user?.assignedClasses?.map((cls) => (
                    <Option key={cls} value={cls}>
                      Class {cls}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item name="section" label="Section" rules={[{ required: true, message: 'Select section' }]}>
                <Select style={{ borderRadius: 8 }}>
                  {user?.assignedSections?.map((sec) => {
                    const normalizedSec = sec.toUpperCase();
                    return (
                      <Option key={normalizedSec} value={normalizedSec}>
                        Section {normalizedSec}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Select subject' }]}>
                <Select showSearch style={{ borderRadius: 8 }}>
                  {subjectList.map((sub) => (
                    <Option key={sub} value={sub}>
                      {sub}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="examName" label="Exam / Test Name" rules={[{ required: true, message: 'Select exam' }]}>
                <Select style={{ borderRadius: 8 }}>
                  {examList.map((exam) => (
                    <Option key={exam} value={exam}>
                      {exam}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item name="maxMarks" label="Max Marks" rules={[{ required: true, message: 'Input max marks' }]}>
                <InputNumber min={1} style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<FormOutlined />}
              loading={loading}
              style={{
                background: '#0b4c33',
                borderColor: '#0b4c33',
                fontWeight: 600,
                borderRadius: 8,
                height: 44,
              }}
            >
              Load Student List
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" description="Loading class list..." />
        </div>
      ) : hasLoaded ? (
        students.length > 0 ? (
          <Card
            className="premium-card"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <BookOutlined style={{ color: '#0b4c33', marginRight: 8 }} />
                  <span style={{ fontWeight: 700 }}>Enter Marks</span>
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 8 }}>
                    ({form.getFieldValue('subject')} - {form.getFieldValue('examName')})
                  </span>
                </div>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={saveMarks}
                  style={{
                    background: '#0b4c33',
                    borderColor: '#0b4c33',
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  Save & Upload Marks
                </Button>
              </div>
            }
          >
            <Table
              dataSource={students}
              columns={columns}
              pagination={false}
              bordered
              style={{ marginBottom: 20 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={saveMarks}
                style={{
                  background: '#0b4c33',
                  borderColor: '#0b4c33',
                  fontWeight: 700,
                  borderRadius: 8,
                  height: 48,
                  padding: '0 32px',
                  boxShadow: '0 4px 12px rgba(11, 76, 51, 0.2)',
                }}
              >
                Save & Upload Marks
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="premium-card">
            <Empty description="No active students found in this class & section." />
          </Card>
        )
      ) : null}
    </div>
  );
};

export default UploadMarksPage;
