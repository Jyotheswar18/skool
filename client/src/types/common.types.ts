export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  mobile?: string;
  assignedClasses: string[];
  assignedSections: string[];
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  name: string;
  admissionNumber: string;
  class: string;
  section: string;
  parentName: string;
  parentMobile: string;
  alternateMobile?: string;
  address?: string;
  joiningDate: string;
  totalFee: number;
  numberOfInstallments: number;
  status: 'active' | 'inactive';
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  _id: string;
  student: string | Student;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  student: string | Student;
  class: string;
  section: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  _id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  publicId?: string;
  originalName?: string;
  size?: number;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventDate: string;
  targetAudience: {
    type: 'school' | 'classes' | 'sections';
    classes: string[];
    sections: string[];
  };
  media: MediaItem[];
  isPublished: boolean;
  publishedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  _id: string;
  type: 'onboarding' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'event_broadcast';
  recipient: {
    name: string;
    phone: string;
    studentId?: Student;
  };
  message: string;
  mediaUrls: string[];
  channel: 'whatsapp';
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
  relatedEntity?: {
    type: 'student' | 'installment' | 'attendance' | 'event';
    id: string;
  };
  sentAt?: string;
  createdAt: string;
}

export interface SchoolConfig {
  _id: string;
  schoolName: string;
  schoolLogo?: string;
  classes: string[];
  sections: string[];
  academicYear: string;
  whatsapp: {
    provider: 'mock' | 'wati' | 'twilio';
    apiKey?: string;
    apiUrl?: string;
    senderNumber?: string;
    enabled: boolean;
  };
  feeReminder: {
    daysBeforeDue: number;
    sendOnDueDate: boolean;
    overdueFrequency: 'daily' | 'weekly';
  };
  attendanceAlert: {
    enabled: boolean;
    sendTime: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
