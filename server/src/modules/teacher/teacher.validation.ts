import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional().or(z.literal('')),
    assignedClasses: z.array(z.string()).default([]),
    assignedSections: z.array(z.string().toUpperCase()).default([]),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateTeacherSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Please enter a valid email').optional(),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional().or(z.literal('')),
    assignedClasses: z.array(z.string()).optional(),
    assignedSections: z.array(z.string().toUpperCase()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const resetTeacherPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
  }),
  body: z.object({
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const getTeacherSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format'),
  }),
});

export const queryTeachersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
