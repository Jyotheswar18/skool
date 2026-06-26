import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  mobile?: string;
  assignedClasses: string[];
  assignedSections: string[];
  status: 'active' | 'inactive';
}

export type AuthRequest = Request;

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationResult;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export type AttendanceStatus = 'present' | 'absent' | 'late';
export type FeeStatus = 'pending' | 'paid' | 'overdue';
export type UserRole = 'admin' | 'teacher';
export type StudentStatus = 'active' | 'inactive';
export type NotificationType = 'onboarding' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'event_broadcast';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed';
export type AudienceType = 'school' | 'classes' | 'sections';
