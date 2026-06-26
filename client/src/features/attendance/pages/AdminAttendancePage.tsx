import React, { useState } from 'react';
import { Card, Select, Button, Table, Space, DatePicker, Row, Col, Progress, Spin, Typography, Tag, Empty } from 'antd';
import { CalendarOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const AdminAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('6');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  // Fetch school config classes/sections
  const { data: configData } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch attendance report stats
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['attendanceReport', selectedClass, selectedSection, dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')],
    queryFn: async () => {
      const res = await apiClient.get(
        `/attendance/report?class=${selectedClass}&section=${selectedSection}&startDate=${dates[0].format('YYYY-MM-DD')}&endDate=${dates[1].format('YYYY-MM-DD')}`
      );
      return res.data.data;
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  const columns = [
    {
      title: 'Adm No.',
      dataIndex: ['student', 'admissionNumber'],
      key: 'admissionNumber',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Student Name',
      dataIndex: ['student', 'name'],
      key: 'studentName',
    },
    {
      title: 'Total Session Days',
      dataIndex: 'totalDays',
      key: 'totalDays',
    },
    {
      title: 'Present Days',
      dataIndex: 'present',
      key: 'present',
      render: (val: number) => <Tag color="green">{val}</Tag>,
    },
    {
      title: 'Absent Days',
      dataIndex: 'absent',
      key: 'absent',
      render: (val: number) => <Tag color="red">{val}</Tag>,
    },
    {
      title: 'Late Days',
      dataIndex: 'late',
      key: 'late',
      render: (val: number) => <Tag color="orange">{val}</Tag>,
    },
    {
      title: 'Attendance %',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val: number) => (
        <Space size="middle" style={{ width: '100%' }}>
          <Progress
            percent={val}
            size="small"
            status={val >= 75 ? 'normal' : 'exception'}
            style={{ width: 120 }}
          />
          <strong>{val}%</strong>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Attendance Reports</h2>
          <span style={{ color: '#475569' }}>Track school attendance records, check performance averages, and review absentees</span>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => navigate('/admin/attendance/mark')}
        >
          Mark Attendance
        </Button>
      </div>

      <Card className="premium-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Class</Text>
            <Select
              style={{ width: '100%' }}
              value={selectedClass}
              onChange={setSelectedClass}
            >
              {configData?.classes.map((c: string) => (
                <Option key={c} value={c}>
                  Class {c}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Section</Text>
            <Select
              style={{ width: '100%' }}
              value={selectedSection}
              onChange={setSelectedSection}
            >
              {configData?.sections.map((s: string) => (
                <Option key={s} value={s}>
                  Section {s}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Date Range</Text>
            <RangePicker
              style={{ width: '100%' }}
              value={dates}
              onChange={(val) => val && setDates(val as any)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => refetch()}
              block
            >
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" description="Aggregating records..." />
        </div>
      ) : reportData ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              title="Class Average Metrics"
              className="premium-card"
              style={{ textAlign: 'center', height: '100%' }}
            >
              <Progress
                type="circle"
                percent={reportData.overallPercentage}
                strokeColor={{
                  '0%': '#ef4444',
                  '50%': '#f59e0b',
                  '100%': '#10b981',
                }}
                style={{ margin: '16px 0' }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Class {selectedClass}-{selectedSection} Overall Average Attendance
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card
              title={`Student Attendance Detail List`}
              className="premium-card"
              extra={
                <Button icon={<FileExcelOutlined />} type="dashed">
                  Export CSV
                </Button>
              }
            >
              <Table
                dataSource={reportData.studentStats || []}
                columns={columns}
                rowKey={(record: any) => record.student?._id || Math.random().toString()}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>
          <Empty description="No report generated. Please check your class selection." />
        </Card>
      )}
    </div>
  );
};

export default AdminAttendancePage;
