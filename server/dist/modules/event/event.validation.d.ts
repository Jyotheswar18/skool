import { z } from 'zod';
export declare const createEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        eventDate: z.ZodString;
        targetAudience: z.ZodObject<{
            type: z.ZodEnum<{
                classes: "classes";
                sections: "sections";
                school: "school";
            }>;
            classes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            sections: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>;
        media: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            type: z.ZodEnum<{
                image: "image";
                video: "video";
            }>;
            thumbnail: z.ZodOptional<z.ZodString>;
            publicId: z.ZodOptional<z.ZodString>;
            originalName: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>>;
        isPublished: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEventSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        eventDate: z.ZodOptional<z.ZodString>;
        targetAudience: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                classes: "classes";
                sections: "sections";
                school: "school";
            }>;
            classes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            sections: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>;
        media: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            type: z.ZodEnum<{
                image: "image";
                video: "video";
            }>;
            thumbnail: z.ZodOptional<z.ZodString>;
            publicId: z.ZodOptional<z.ZodString>;
            originalName: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getEventSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const queryEventsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=event.validation.d.ts.map