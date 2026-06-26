import { z } from 'zod';

export const getStudentMarksSchema = z.object({
  query: z.object({
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
    subject: z.string().min(1, 'Subject is required'),
    examName: z.string().min(1, 'Exam name is required'),
  }),
});

export const uploadMarksSchema = z.object({
  body: z.object({
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
    subject: z.string().min(1, 'Subject is required'),
    examName: z.string().min(1, 'Exam name is required'),
    maxMarks: z.number().min(1, 'Maximum marks must be at least 1').default(100),
    students: z.array(
      z.object({
        studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
        marksObtained: z.number().min(0, 'Marks obtained cannot be negative'),
        comments: z.string().optional().or(z.literal('')),
      })
    ).min(1, 'At least one student record is required'),
  }),
});
