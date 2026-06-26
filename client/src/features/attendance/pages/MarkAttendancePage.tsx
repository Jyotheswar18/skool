import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Radio, Space, DatePicker, App, Spin, Typography } from 'antd';
import { CheckSquareOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { apiClient } from '../../../api/axios';
import { useAuth } from '../../auth/hooks/useAuth';

const { Option } = Select;
const { Title, Text } = Typography;

export const MarkAttendancePage: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as any;

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string | undefined>(state?.selectedClass);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(state?.selectedSection);
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs());

  // Attendance records map: studentId -> status
  const [records, setRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  // Fetch school config classes/sections if Admin
  const { data: configData } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
    enabled: user?.role === 'admin',
  });

  // Fetch assigned classes/sections lists (from user profile or config)
  const classes = user?.role === 'admin' ? (configData?.classes || []) : (user?.assignedClasses || []);
  const sections = user?.role === 'admin' 
    ? (configData?.sections || []) 
    : (user?.assignedSections || []).map((s: string) => s.toUpperCase());

  // Fetch students in selected class/section
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['studentsForAttendance', selectedClass, selectedSection],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return [];
      const res = await apiClient.get(
        `/students?class=${selectedClass}&section=${selectedSection}&status=active&limit=100`
      );
      return res.data.data;
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  // Fetch existing attendance for this class/section and date to pre-populate (enables SAME-DAY EDITS!)
  const { data: existingAttendance, isLoading: loadingExisting } = useQuery({
    queryKey: ['existingAttendance', selectedClass, selectedSection, date.format('YYYY-MM-DD')],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return [];
      const res = await apiClient.get(
        `/attendance?class=${selectedClass}&section=${selectedSection}&date=${date.format('YYYY-MM-DD')}`
      );
      return res.data.data;
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  // Update records state when students or existing attendance logs load
  useEffect(() => {
    if (students) {
      const initialRecords: Record<string, 'present' | 'absent' | 'late'> = {};
      
      // Default all to present
      students.forEach((student: any) => {
        initialRecords[student._id] = 'present';
      });

      // Override with existing saved status if found
      if (existingAttendance && existingAttendance.length > 0) {
        existingAttendance.forEach((att: any) => {
          if (att.student && att.student._id) {
            initialRecords[att.student._id] = att.status;
          }
        });
      }

      setRecords(initialRecords);
    }
  }, [students, existingAttendance]);

  // Submit attendance mutation
  const markMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        class: selectedClass,
        section: selectedSection,
        date: date.format('YYYY-MM-DD'),
        records: Object.entries(records).map(([student, status]) => ({
          student,
          status,
        })),
      };
      return apiClient.post('/attendance', payload);
    },
    onSuccess: () => {
      message.success('Attendance saved successfully! Absence WhatsApp alerts triggered.');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to submit attendance');
    },
  });

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    if (!students) return;
    const updated = { ...records };
    students.forEach((student: any) => {
      updated[student._id] = 'present';
    });
    setRecords(updated);
  };

  const columns = [
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
    },
    {
      title: 'Mark Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Radio.Group
          value={records[record._id] || 'present'}
          onChange={(e) => handleStatusChange(record._id, e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="present" style={{ color: '#10b981' }}>Present</Radio.Button>
          <Radio.Button value="absent" style={{ color: '#ef4444' }}>Absent</Radio.Button>
          <Radio.Button value="late" style={{ color: '#f59e0b' }}>Late</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Daily Attendance</h2>
        <span style={{ color: '#475569' }}>Mark present, absent, or late statuses for your students</span>
      </div>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Date</Text>
            <DatePicker
              value={date}
              onChange={(d) => d && setDate(d)}
              format="YYYY-MM-DD"
              allowClear={false}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </div>

          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Class</Text>
            <Select
              style={{ width: 140 }}
              placeholder="Select Class"
              value={selectedClass}
              onChange={(v) => {
                setSelectedClass(v);
                setRecords({});
              }}
            >
              {classes.map((c: string) => (
                <Option key={c} value={c}>
                  Class {c}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Section</Text>
            <Select
              style={{ width: 140 }}
              placeholder="Select Section"
              value={selectedSection}
              onChange={(v) => {
                setSelectedSection(v);
                setRecords({});
              }}
            >
              {sections.map((s: string) => (
                <Option key={s} value={s}>
                  Section {s}
                </Option>
              ))}
            </Select>
          </div>

          {students && students.length > 0 && (
            <div style={{ alignSelf: 'flex-end' }}>
              <Button type="dashed" onClick={handleMarkAllPresent}>
                Mark All Present
              </Button>
            </div>
          )}
        </Space>
      </Card>

      {selectedClass && selectedSection ? (
        <Card
          className="premium-card"
          title={
            <span>
              Students List for Class {selectedClass}-{selectedSection} (Total:{' '}
              {students?.length || 0})
            </span>
          }
          extra={
            students &&
            students.length > 0 && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => markMutation.mutate()}
                loading={markMutation.isPending}
              >
                Save Attendance
              </Button>
            )
          }
        >
          {loadingStudents || loadingExisting ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin description="Fetching students..." />
            </div>
          ) : students && students.length > 0 ? (
            <Table
              dataSource={students}
              columns={columns}
              rowKey="_id"
              pagination={false}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Text type="secondary">No active students registered in Class {selectedClass}-{selectedSection}</Text>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckSquareOutlined style={{ fontSize: 40, color: '#bfbfbf', marginBottom: 12 }} />
          <Title level={5} style={{ margin: 0, color: '#475569' }}>
            Please select a Class and Section to start marking attendance.
          </Title>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendancePage;
