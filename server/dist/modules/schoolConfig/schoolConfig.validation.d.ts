import { z } from 'zod';
export declare const updateConfigSchema: z.ZodObject<{
    body: z.ZodObject<{
        schoolName: z.ZodOptional<z.ZodString>;
        schoolLogo: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        classes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        sections: z.ZodOptional<z.ZodArray<z.ZodString>>;
        academicYear: z.ZodOptional<z.ZodString>;
        sms: z.ZodOptional<z.ZodObject<{
            provider: z.ZodEnum<{
                mock: "mock";
                twilio: "twilio";
            }>;
            apiKey: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            apiUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            senderNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            enabled: z.ZodBoolean;
        }, z.core.$strip>>;
        feeReminder: z.ZodOptional<z.ZodObject<{
            daysBeforeDue: z.ZodNumber;
            sendOnDueDate: z.ZodBoolean;
            overdueFrequency: z.ZodEnum<{
                daily: "daily";
                weekly: "weekly";
            }>;
        }, z.core.$strip>>;
        attendanceAlert: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            sendTime: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=schoolConfig.validation.d.ts.map