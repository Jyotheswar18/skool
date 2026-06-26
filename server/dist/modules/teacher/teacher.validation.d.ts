import { z } from 'zod';
export declare const createTeacherSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        mobile: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        assignedClasses: z.ZodDefault<z.ZodArray<z.ZodString>>;
        assignedSections: z.ZodDefault<z.ZodArray<z.ZodString>>;
        status: z.ZodDefault<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateTeacherSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        mobile: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        assignedClasses: z.ZodOptional<z.ZodArray<z.ZodString>>;
        assignedSections: z.ZodOptional<z.ZodArray<z.ZodString>>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const resetTeacherPasswordSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getTeacherSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const queryTeachersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=teacher.validation.d.ts.map