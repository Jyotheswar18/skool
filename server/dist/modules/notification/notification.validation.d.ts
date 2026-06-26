import { z } from 'zod';
export declare const queryNotificationsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            onboarding: "onboarding";
            fee_reminder: "fee_reminder";
            fee_overdue: "fee_overdue";
            attendance_alert: "attendance_alert";
            event_broadcast: "event_broadcast";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            queued: "queued";
            sent: "sent";
            delivered: "delivered";
            failed: "failed";
        }>>;
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=notification.validation.d.ts.map