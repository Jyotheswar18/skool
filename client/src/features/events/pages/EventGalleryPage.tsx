import React from 'react';
import { Card, Row, Col, Typography, Image, Empty, Spin, Button, Tag, Divider, Space } from 'antd';
import { CalendarOutlined, PictureOutlined, LeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Event } from '../../../types/common.types';

const { Title, Text, Paragraph } = Typography;

export const EventGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch only published events for the gallery wall
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['publishedEvents'],
    queryFn: async () => {
      const res = await apiClient.get('/events?isPublished=true');
      return res.data;
    },
  });

  const events: Event[] = eventsData?.data || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Loading media gallery..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate('/admin/events')}
          style={{ marginRight: 12 }}
        />
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Event Gallery</h2>
          <span style={{ color: '#475569' }}>View published celebrations, events, and parental updates</span>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="premium-card" style={{ padding: '40px 0', textAlign: 'center' }}>
          <Empty description="No published celebrations found. Publish drafted events to display them in this gallery." />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {events.map((event) => (
            <Col xs={24} md={12} lg={8} key={event._id}>
              <Card
                className="premium-card"
                hoverable
                cover={
                  event.media.length > 0 ? (
                    <Image
                      alt={event.title}
                      src={event.media[0].url}
                      style={{ height: 200, objectFit: 'cover' }}
                      preview={false} // Click preview managed inside image list
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      <PictureOutlined style={{ fontSize: 32 }} />
                    </div>
                  )
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <Tag color="geekblue">{event.targetAudience.type.toUpperCase()}</Tag>
                  <Text type="secondary" style={{ fontSize: 12, float: 'right' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </Text>
                </div>
                <Title level={4} style={{ marginTop: 0, marginBottom: 8, fontWeight: 700 }}>
                  {event.title}
                </Title>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {event.description || 'No description provided.'}
                </Paragraph>

                {event.media.length > 0 && (
                  <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      Celebration Media Group ({event.media.length} files)
                    </Text>
                    <Image.PreviewGroup>
                      <Space size="small" wrap>
                        {event.media.map((item, idx) => (
                          <Image
                            key={item._id}
                            src={item.url}
                            width={48}
                            height={48}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default EventGalleryPage;
