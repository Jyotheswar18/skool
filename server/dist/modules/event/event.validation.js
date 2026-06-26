"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryEventsSchema = exports.getEventSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const mediaItemInputSchema = zod_1.z.object({
    url: zod_1.z.string().url('Media URL must be valid'),
    type: zod_1.z.enum(['image', 'video']),
    thumbnail: zod_1.z.string().url().optional(),
    publicId: zod_1.z.string().optional(),
    originalName: zod_1.z.string().optional(),
    size: zod_1.z.number().optional(),
});
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
        description: zod_1.z.string().max(2000).optional(),
        eventDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid event date format',
        }),
        targetAudience: zod_1.z.object({
            type: zod_1.z.enum(['school', 'classes', 'sections']),
            classes: zod_1.z.array(zod_1.z.string()).optional().default([]),
            sections: zod_1.z.array(zod_1.z.string().toUpperCase()).optional().default([]),
        }),
        media: zod_1.z.array(mediaItemInputSchema).optional().default([]),
        isPublished: zod_1.z.boolean().optional().default(false),
    }),
});
exports.updateEventSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200).optional(),
        description: zod_1.z.string().max(2000).optional(),
        eventDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid event date format',
        }).optional(),
        targetAudience: zod_1.z.object({
            type: zod_1.z.enum(['school', 'classes', 'sections']),
            classes: zod_1.z.array(zod_1.z.string()).optional().default([]),
            sections: zod_1.z.array(zod_1.z.string().toUpperCase()).optional().default([]),
        }).optional(),
        media: zod_1.z.array(mediaItemInputSchema).optional(),
        isPublished: zod_1.z.boolean().optional(),
    }),
});
exports.getEventSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
    }),
});
exports.queryEventsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        isPublished: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=event.validation.js.map