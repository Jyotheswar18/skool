export const USER_ROLES = {
  ADMIN: 'admin' as const,
  TEACHER: 'teacher' as const,
};

export const STUDENT_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present' as const,
  ABSENT: 'absent' as const,
  LATE: 'late' as const,
};

export const FEE_STATUS = {
  PENDING: 'pending' as const,
  PAID: 'paid' as const,
  OVERDUE: 'overdue' as const,
};

export const NOTIFICATION_TYPES = {
  ONBOARDING: 'onboarding' as const,
  FEE_REMINDER: 'fee_reminder' as const,
  FEE_OVERDUE: 'fee_overdue' as const,
  ATTENDANCE_ALERT: 'attendance_alert' as const,
  EVENT_BROADCAST: 'event_broadcast' as const,
};

export const NOTIFICATION_STATUS = {
  QUEUED: 'queued' as const,
  SENT: 'sent' as const,
  DELIVERED: 'delivered' as const,
  FAILED: 'failed' as const,
};

export const AUDIENCE_TYPES = {
  SCHOOL: 'school' as const,
  CLASSES: 'classes' as const,
  SECTIONS: 'sections' as const,
};

export const DEFAULT_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export const DEFAULT_SECTIONS = ['A', 'B', 'C'];
