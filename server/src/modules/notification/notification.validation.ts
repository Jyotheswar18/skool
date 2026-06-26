import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['onboarding', 'fee_reminder', 'fee_overdue', 'attendance_alert', 'event_broadcast']).optional(),
    status: z.enum(['queued', 'sent', 'delivered', 'failed']).optional(),
    search: z.string().optional(),
  }),
});
