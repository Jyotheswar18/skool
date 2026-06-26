import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { StudentService } from './student.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class StudentController {
  static create = async (req: AuthRequest, res: Response) => {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const student = await StudentService.createStudent(req.body, creatorId);
    return sendSuccess(res, student, 'Student created successfully', 201);
  };

  static update = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const student = await StudentService.updateStudent(id, req.body);

    if (!student) {
      return sendError(res, 'Student not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, student, 'Student updated successfully');
  };

  static delete = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const deleted = await StudentService.deleteStudent(id);

    if (!deleted) {
      return sendError(res, 'Student not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, null, 'Student soft-deleted successfully');
  };

  static getProfile = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const profile = await StudentService.getStudentProfile(id);

    if (!profile) {
      return sendError(res, 'Student not found', 404, 'NOT_FOUND');
    }

    // Role-based verification for teachers
    if (req.user?.role === 'teacher') {
      const isAssignedClass = req.user.assignedClasses.includes(profile.student.class);
      const isAssignedSection = req.user.assignedSections.includes(profile.student.section);

      if (!isAssignedClass || !isAssignedSection) {
        return sendError(
          res,
          'Access denied. Student is not in your assigned class and section.',
          403,
          'FORBIDDEN'
        );
      }
    }

    return sendSuccess(res, profile, 'Student profile fetched successfully');
  };

  static list = async (req: AuthRequest, res: Response) => {
    const query: any = { ...req.query };

    // Role-based restrictions for teachers
    if (req.user?.role === 'teacher') {
      // Normalize assigned arrays to uppercase for consistent comparison
      const normalizedClasses = req.user.assignedClasses.map((c: string) => c.trim());
      const normalizedSections = req.user.assignedSections.map((s: string) => s.trim().toUpperCase());

      // If teacher filters by class, ensure it's one of their assigned classes
      if (query.class && !normalizedClasses.includes(query.class.trim())) {
        return sendError(res, 'Access denied to this class', 403, 'FORBIDDEN');
      }
      
      // If teacher filters by section, ensure it's one of their assigned sections
      if (query.section && !normalizedSections.includes(query.section.trim().toUpperCase())) {
        return sendError(res, 'Access denied to this section', 403, 'FORBIDDEN');
      }

      // If no specific filters, default to teacher's scope
      if (!query.class) {
        query.class = { $in: normalizedClasses };
      }
      if (!query.section) {
        query.section = { $in: normalizedSections };
      }
    }

    const { students, pagination } = await StudentService.queryStudents(query);
    return sendSuccess(res, students, 'Students listed successfully', 200, pagination);
  };
}
