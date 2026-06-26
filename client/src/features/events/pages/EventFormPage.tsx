import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, DatePicker, Upload, App, Spin, Space, List, Image } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { apiClient } from '../../../api/axios';
import { Event } from '../../../types/common.types';

const { Option } = Select;
const { TextArea } = Input;

export const EventFormPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [audienceType, setAudienceType] = useState<'school' | 'classes' | 'sections'>('school');

  // Fetch school config for target audience classes/sections
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/config');
      return res.data.data;
    },
  });

  // Fetch event details if editing
  const fetchEventDetails = async () => {
    if (!isEditMode) return;
    setLoadingEvent(true);
    try {
      const res = await apiClient.get(`/events/${id}`);
      const event = res.data.data;
      setEventData(event);
      setAudienceType(event.targetAudience.type);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        eventDate: dayjs(event.eventDate),
        audienceType: event.targetAudience.type,
        targetClasses: event.targetAudience.classes,
        targetSections: event.targetAudience.sections,
      });
    } catch (error) {
      console.error('Failed to load event details:', error);
      message.error('Failed to load event details');
      navigate('/admin/events');
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, isEditMode]);

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiClient.post('/events', values);
      return res.data.data;
    },
    onSuccess: (data) => {
      message.success('Event drafted successfully. You can now upload pictures or publish.');
      navigate(`/admin/events/edit/${data._id}`);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to create event');
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiClient.put(`/events/${id}`, values);
    },
    onSuccess: () => {
      message.success('Event details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      fetchEventDetails();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error?.message || 'Failed to update event');
    },
  });

  // Delete media item mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      return apiClient.delete(`/events/${id}/media/${mediaId}`); // In real backend, we'd pull from event.media
    },
    onSuccess: () => {
      message.success('Media file removed');
      fetchEventDetails();
    },
    onError: () => {
      message.error('Failed to remove media file');
    },
  });

  const onFinish = (values: any) => {
    const formattedValues = {
      title: values.title,
      description: values.description,
      eventDate: values.eventDate.format('YYYY-MM-DD'),
      targetAudience: {
        type: values.audienceType,
        classes: values.audienceType !== 'school' ? values.targetClasses : [],
        sections: values.audienceType === 'sections' ? values.targetSections : [],
      },
    };

    if (isEditMode) {
      updateMutation.mutate(formattedValues);
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  // Custom upload handler to post files to /api/events/:id/media
  const handleUpload = async () => {
    if (fileList.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('media', file);
    });

    try {
      await apiClient.post(`/events/${id}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Media files uploaded successfully');
      setFileList([]);
      fetchEventDetails();
    } catch (error: any) {
      console.error('Upload failed:', error);
      message.error(error.response?.data?.error?.message || 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    fileList,
    multiple: true,
  };

  const loading = loadingConfig || loadingEvent;

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
          {isEditMode ? `Edit Event: ${eventData?.title}` : 'Draft School Event'}
        </h2>
        <span style={{ color: '#475569' }}>
          Configure event, assign target parent audience, and upload media galleries
        </span>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark size="large">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Event Details" className="premium-card" style={{ marginBottom: 24 }}>
              <Form.Item
                name="title"
                label="Event Title"
                rules={[{ required: true, message: 'Event title is required' }]}
              >
                <Input placeholder="e.g. Independence Day Celebration, Sports Day" />
              </Form.Item>

              <Form.Item name="description" label="Description / Broadcast Message">
                <TextArea placeholder="Enter details to be shared with parents..." rows={4} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="eventDate"
                    label="Event Date"
                    rules={[{ required: true, message: 'Event date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="audienceType"
                    label="Target Audience"
                    rules={[{ required: true, message: 'Target audience is required' }]}
                    initialValue="school"
                  >
                    <Select onChange={(val) => setAudienceType(val)}>
                      <Option value="school">Entire School</Option>
                      <Option value="classes">Specific Classes</Option>
                      <Option value="sections">Specific Sections</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {audienceType !== 'school' && (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="targetClasses"
                      label="Classes Target"
                      rules={[{ required: true, message: 'Select at least one class' }]}
                    >
                      <Select mode="multiple" placeholder="Select classes">
                        {configData?.classes.map((c: string) => (
                          <Option key={c} value={c}>
                            Class {c}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {audienceType === 'sections' && (
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="targetSections"
                        label="Sections Target"
                        rules={[{ required: true, message: 'Select at least one section' }]}
                      >
                        <Select mode="multiple" placeholder="Select sections">
                          {configData?.sections.map((s: string) => (
                            <Option key={s} value={s}>
                              Section {s}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              )}
            </Card>

            {isEditMode && (
              <Card title="Upload Media Gallery (Images & Videos)" className="premium-card" style={{ marginBottom: 24 }}>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Upload.Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag files to this area to select</p>
                      <p className="ant-upload-hint">Support for single or bulk upload. Max size 50MB.</p>
                    </Upload.Dragger>
                    <Button
                      type="primary"
                      onClick={handleUpload}
                      disabled={fileList.length === 0}
                      loading={uploading}
                      style={{ marginTop: 16 }}
                      block
                    >
                      {uploading ? 'Uploading Files...' : 'Start Uploading Selected Files'}
                    </Button>
                  </Col>

                  <Col xs={24} md={12}>
                    <h4 style={{ marginBottom: 12 }}>Current Media Gallery ({eventData?.media.length || 0} files)</h4>
                    {eventData?.media.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: 13 }}>No files uploaded yet.</div>
                    ) : (
                      <List
                        grid={{ gutter: 12, column: 3 }}
                        dataSource={eventData?.media || []}
                        renderItem={(item: any) => (
                          <List.Item>
                            <Card
                              styles={{ body: { padding: 4 } }}
                              cover={
                                <Image
                                  src={item.url}
                                  alt="media"
                                  style={{ height: 80, objectFit: 'cover' }}
                                />
                              }
                              actions={[
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => deleteMediaMutation.mutate(item._id)}
                                />,
                              ]}
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Col>
                </Row>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card className="premium-card">
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  block
                >
                  {isEditMode ? 'Save Event Details' : 'Draft Event'}
                </Button>
                <Button onClick={() => navigate('/admin/events')} block>
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

export default EventFormPage;
