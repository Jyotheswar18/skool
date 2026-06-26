import { z } from 'zod';
export declare const payInstallmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getStudentInstallmentsSchema: z.ZodObject<{
    params: z.ZodObject<{
        studentId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getFeeReportSchema: z.ZodObject<{
    query: z.ZodObject<{
        class: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            paid: "paid";
            overdue: "overdue";
        }>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=fee.validation.d.ts.map