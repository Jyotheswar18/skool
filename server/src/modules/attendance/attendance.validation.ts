import { z } from 'zod';

const attendanceRecordItemSchema = z.object({
  student: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
  status: z.enum(['present', 'absent', 'late']),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required').max(5),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format (must be YYYY-MM-DD)',
    }),
    records: z.array(attendanceRecordItemSchema).min(1, 'At least one student record is required'),
  }),
});

export const getAttendanceSchema = z.object({
  query: z.object({
    class: z.string().optional(),
    section: z.string().optional(),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    student: z.string().optional(),
  }),
});

export const getAttendanceReportSchema = z.object({
  query: z.object({
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid startDate',
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid endDate',
    }),
  }),
});
