import { z } from 'zod';
export declare const markAttendanceSchema: z.ZodObject<{
    body: z.ZodObject<{
        class: z.ZodString;
        section: z.ZodString;
        date: z.ZodString;
        records: z.ZodArray<z.ZodObject<{
            student: z.ZodString;
            status: z.ZodEnum<{
                present: "present";
                absent: "absent";
                late: "late";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getAttendanceSchema: z.ZodObject<{
    query: z.ZodObject<{
        class: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        student: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getAttendanceReportSchema: z.ZodObject<{
    query: z.ZodObject<{
        class: z.ZodString;
        section: z.ZodString;
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=attendance.validation.d.ts.map