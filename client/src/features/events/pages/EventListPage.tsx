import React, { useState } from 'react';
import { Table, Card, Button, Space, Tag, Modal, App, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, NotificationOutlined, PictureOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Event } from '../../../types/common.types';

const { Title, Text } = Typography;

export const EventListPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', page],
    queryFn: async () => {
      const res = await apiClient.get(`/events?page=${page}&limit=15`);
      return res.data;
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/events/${id}`);
    },
    onSuccess: () => {
      message.success('Event record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to delete event');
    },
  });

  // Publish event mutation (Triggers WhatsApp Broadcast!)
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/events/${id}/publish`);
    },
    onSuccess: () => {
      message.success('Event published! WhatsApp celebration updates broadcasted to parents.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to publish event');
    },
  });

  const handleDelete = (record: Event) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this event?',
      content: `This will remove "${record.title}" and delete any associated local media.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(record._id),
    });
  };

  const handlePublish = (record: Event) => {
    Modal.confirm({
      title: 'Publish and Broadcast Event?',
      content: `Publishing "${record.title}" will immediately send a WhatsApp broadcast to all parents matching the target audience: ${record.targetAudience.type.toUpperCase()}.`,
      okText: 'Publish & Broadcast',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: () => publishMutation.mutate(record._id),
    });
  };

  const columns = [
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Target Audience',
      dataIndex: ['targetAudience', 'type'],
      key: 'audienceType',
      render: (type: string, record: Event) => {
        let label = type.toUpperCase();
        if (type === 'classes') {
          label = `Classes: ${record.targetAudience.classes.join(', ')}`;
        }
        if (type === 'sections') {
          label = `Classes: ${record.targetAudience.classes.join(', ')} (Sec: ${record.targetAudience.sections.join(', ')})`;
        }
        return <Tag color="geekblue">{label}</Tag>;
      },
    },
    {
      title: 'Media Items',
      dataIndex: 'media',
      key: 'media',
      render: (media: any[]) => (
        <span>
          <PictureOutlined style={{ marginRight: 6 }} />
          {media.length} files
        </span>
      ),
    },
    {
      title: 'Publish Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean, record: Event) =>
        isPublished ? (
          <Tag color="green">Published ({new Date(record.publishedAt || '').toLocaleDateString()})</Tag>
        ) : (
          <Tag color="orange">Draft</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Event) => (
        <Space>
          {!record.isPublished && (
            <Button
              type="primary"
              size="small"
              icon={<NotificationOutlined />}
              onClick={() => handlePublish(record)}
            >
              Publish & Broadcast
            </Button>
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/events/edit/${record._id}`)}
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
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>School Events</h2>
          <span style={{ color: '#475569' }}>Announce school celebrations, upload photos, and broadcast updates to parents</span>
        </div>
        <Space>
          <Button
            type="dashed"
            icon={<PictureOutlined />}
            size="large"
            onClick={() => navigate('/admin/events/gallery')}
          >
            Gallery Wall
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/admin/events/new')}
          >
            Create Event
          </Button>
        </Space>
      </div>

      <Card className="premium-card">
        <Table
          dataSource={eventsData?.data || []}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 15,
            total: eventsData?.pagination?.total || 0,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default EventListPage;
