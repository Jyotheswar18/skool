import { z } from 'zod';
export declare const getStudentMarksSchema: z.ZodObject<{
    query: z.ZodObject<{
        class: z.ZodString;
        section: z.ZodString;
        subject: z.ZodString;
        examName: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const uploadMarksSchema: z.ZodObject<{
    body: z.ZodObject<{
        class: z.ZodString;
        section: z.ZodString;
        subject: z.ZodString;
        examName: z.ZodString;
        maxMarks: z.ZodDefault<z.ZodNumber>;
        students: z.ZodArray<z.ZodObject<{
            studentId: z.ZodString;
            marksObtained: z.ZodNumber;
            comments: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=marks.validation.d.ts.map