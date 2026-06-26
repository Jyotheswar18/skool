import { z } from 'zod';

export const payInstallmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid installment ID format'),
  }),
  body: z.object({
    notes: z.string().max(500).optional(),
  }),
});

export const getStudentInstallmentsSchema = z.object({
  params: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
  }),
});

export const getFeeReportSchema = z.object({
  query: z.object({
    class: z.string().optional(),
    section: z.string().optional(),
    status: z.enum(['pending', 'paid', 'overdue']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
