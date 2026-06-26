import { z } from 'zod';
export declare const createStudentSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        admissionNumber: z.ZodString;
        class: z.ZodString;
        section: z.ZodString;
        parentName: z.ZodString;
        parentMobile: z.ZodString;
        alternateMobile: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        parentEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        address: z.ZodOptional<z.ZodString>;
        joiningDate: z.ZodString;
        totalFee: z.ZodNumber;
        numberOfInstallments: z.ZodNumber;
        feeEndDate: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateStudentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        class: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
        parentName: z.ZodOptional<z.ZodString>;
        parentMobile: z.ZodOptional<z.ZodString>;
        alternateMobile: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        parentEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        address: z.ZodOptional<z.ZodString>;
        joiningDate: z.ZodOptional<z.ZodString>;
        totalFee: z.ZodOptional<z.ZodNumber>;
        numberOfInstallments: z.ZodOptional<z.ZodNumber>;
        feeEndDate: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getStudentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const queryStudentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        class: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>>;
        sortBy: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=student.validation.d.ts.map