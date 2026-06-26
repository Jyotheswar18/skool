import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag, Alert, Spin, Drawer, List, Avatar, Empty } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  CheckSquareOutlined, 
  FormOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState<any>(null);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/teacher');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading dashboard data..." />
      </div>
    );
  }

  const { stats, classCompletion } = dashboardData || {
    stats: {
      assignedClassesCount: 0,
      assignedSectionsCount: 0,
      totalStudents: 0,
      todayAttendance: { present: 0, absent: 0, late: 0, total: 0 },
    },
    classCompletion: [],
  };

  const columns = [
    {
      title: 'Class & Section',
      key: 'classSection',
      render: (_: any, record: any) => (
        <span>
          <strong style={{ color: '#0b4c33', fontSize: '15px' }}>Class {record.class}</strong>
          <Tag color="gold" style={{ marginLeft: 8, fontWeight: 700 }}>{record.section}</Tag>
        </span>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => (
        <span>
          <BookOutlined style={{ color: '#0b4c33', marginRight: 6 }} />
          <span style={{ fontWeight: 600, color: '#334155' }}>{text}</span>
        </span>
      ),
    },
    {
      title: 'Timing',
      dataIndex: 'timing',
      key: 'timing',
      render: (text: string) => (
        <span>
          <ClockCircleOutlined style={{ color: '#eab308', marginRight: 6 }} />
          <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>{text}</span>
        </span>
      ),
    },
    {
      title: 'Total Students',
      dataIndex: 'studentCount',
      key: 'studentCount',
      render: (count: number) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>{count} Students</span>
      ),
    },
    {
      title: 'Present Today',
      key: 'presentToday',
      render: (_: any, record: any) => {
        if (!record.isMarked) {
          return <Tag color="orange">Attendance Pending</Tag>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag color="green" style={{ fontWeight: 700 }}>
              {record.presentStudentsCount} / {record.studentCount} Present
            </Tag>
            {record.presentStudentsCount > 0 && (
              <Button 
                type="link" 
                size="small" 
                style={{ padding: 0, height: 'auto', fontSize: '12px', color: '#0b4c33', fontWeight: 600 }}
                onClick={() => {
                  setSelectedClassData(record);
                  setDrawerVisible(true);
                }}
              >
                View Present
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.isMarked) {
          return <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Marked</span>;
        }
        return (
          <Button
            type="primary"
            icon={<FormOutlined />}
            style={{
              background: '#0b4c33',
              borderColor: '#0b4c33',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: 6,
            }}
            onClick={() =>
              navigate('/teacher/attendance', {
                state: { selectedClass: record.class, selectedSection: record.section },
              })
            }
          >
            Mark
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Dashboard</h2>
        <span style={{ color: '#475569' }}>Welcome back to the teacher panel</span>
      </div>

      {classCompletion.some((c: any) => !c.isMarked) && (
        <Alert
          title="Attendance Pending"
          description="You have classes that haven't had attendance marked for today yet. Please mark it before school hours end."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="premium-card">
            <Statistic
              title="Assigned Scope"
              value={stats.assignedClassesCount}
              suffix={`Classes / ${stats.assignedSectionsCount} Sections`}
              prefix={<BookOutlined style={{ color: '#0b4c33', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="premium-card">
            <Statistic
              title="Assigned Students"
              value={stats.totalStudents}
              prefix={<TeamOutlined style={{ color: '#0b4c33', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="premium-card">
            <Statistic
              title="Today's Attendance summary"
              value={stats.todayAttendance.present}
              suffix={`/ ${stats.todayAttendance.total} Present`}
              prefix={<CheckSquareOutlined style={{ color: '#eab308', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Class list table */}
      <Card title="Your Assigned Classes & Status" className="premium-card">
        <Table
          dataSource={classCompletion}
          columns={columns}
          rowKey={(record) => `${record.class}-${record.section}`}
          pagination={false}
        />
      </Card>

      {/* Drawer to display present students */}
      <Drawer
        title={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0b4c33' }}>
              Present Students Today
            </span>
            {selectedClassData && (
              <span style={{ fontSize: '13px', color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                Class {selectedClassData.class}-{selectedClassData.section} | {selectedClassData.subject} ({selectedClassData.timing})
              </span>
            )}
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={380}
        styles={{
          header: { borderBottom: '1px solid #f1f5f9' },
          body: { padding: '20px 24px' }
        }}
      >
        {selectedClassData && selectedClassData.presentStudents && selectedClassData.presentStudents.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={selectedClassData.presentStudents}
            renderItem={(student: any) => (
              <List.Item style={{ padding: '12px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#e6f4ea', color: '#0b4c33' }}
                    />
                  }
                  title={
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {student.name}
                    </span>
                  }
                  description={
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Adm No: {student.admissionNumber}
                    </span>
                  }
                />
                <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 12, fontWeight: 600 }}>
                  Present
                </Tag>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No present students found or attendance not marked yet." />
        )}
      </Drawer>
    </div>
  );
};

export default TeacherDashboard;
