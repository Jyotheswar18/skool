import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    admissionNumber: z.string().min(1, 'Admission number is required'),
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required').max(5),
    parentName: z.string().min(2, 'Parent name is required').max(100),
    parentMobile: z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits'),
    alternateMobile: z.string().regex(/^[0-9]{10}$/, 'Alternate mobile number must be exactly 10 digits').optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid joining date format',
    }),
    totalFee: z.number().min(0, 'Total fee cannot be negative'),
    numberOfInstallments: z.number().int().min(1, 'At least 1 installment required').max(12, 'Maximum 12 installments allowed'),
    feeEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid fee end date format',
    }).optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    class: z.string().min(1, 'Class is required').optional(),
    section: z.string().min(1, 'Section is required').max(5).optional(),
    parentName: z.string().min(2, 'Parent name is required').max(100).optional(),
    parentMobile: z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits').optional(),
    alternateMobile: z.string().regex(/^[0-9]{10}$/, 'Alternate mobile number must be exactly 10 digits').optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid joining date format',
    }).optional(),
    totalFee: z.number().min(0, 'Total fee cannot be negative').optional(),
    numberOfInstallments: z.number().int().min(1, 'At least 1 installment required').max(12, 'Maximum 12 installments allowed').optional(),
    feeEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid fee end date format',
    }).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const getStudentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
  }),
});

export const queryStudentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    class: z.string().optional(),
    section: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
