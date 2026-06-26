import { z } from 'zod';

const mediaItemInputSchema = z.object({
  url: z.string().url('Media URL must be valid'),
  type: z.enum(['image', 'video']),
  thumbnail: z.string().url().optional(),
  publicId: z.string().optional(),
  originalName: z.string().optional(),
  size: z.number().optional(),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(2000).optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid event date format',
    }),
    targetAudience: z.object({
      type: z.enum(['school', 'classes', 'sections']),
      classes: z.array(z.string()).optional().default([]),
      sections: z.array(z.string().toUpperCase()).optional().default([]),
    }),
    media: z.array(mediaItemInputSchema).optional().default([]),
    isPublished: z.boolean().optional().default(false),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200).optional(),
    description: z.string().max(2000).optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid event date format',
    }).optional(),
    targetAudience: z.object({
      type: z.enum(['school', 'classes', 'sections']),
      classes: z.array(z.string()).optional().default([]),
      sections: z.array(z.string().toUpperCase()).optional().default([]),
    }).optional(),
    media: z.array(mediaItemInputSchema).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const getEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
  }),
});

export const queryEventsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    isPublished: z.string().optional(),
  }),
});
