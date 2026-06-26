import { z } from 'zod';

export const updateConfigSchema = z.object({
  body: z.object({
    schoolName: z.string().min(1, 'School name is required').optional(),
    schoolLogo: z.string().url().optional().or(z.literal('')),
    classes: z.array(z.string()).min(1, 'At least one class is required').optional(),
    sections: z.array(z.string().toUpperCase()).min(1, 'At least one section is required').optional(),
    academicYear: z.string().min(1, 'Academic year is required').optional(),
    whatsapp: z.object({
      provider: z.enum(['mock', 'wati', 'twilio']),
      apiKey: z.string().optional().or(z.literal('')),
      apiUrl: z.string().optional().or(z.literal('')),
      senderNumber: z.string().optional().or(z.literal('')),
      enabled: z.boolean(),
    }).optional(),
    feeReminder: z.object({
      daysBeforeDue: z.number().int().min(1).max(30),
      sendOnDueDate: z.boolean(),
      overdueFrequency: z.enum(['daily', 'weekly']),
    }).optional(),
    attendanceAlert: z.object({
      enabled: z.boolean(),
      sendTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    }).optional(),
  }),
});
