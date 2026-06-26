import { Request, Response } from 'express';
import { TeacherService } from './teacher.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class TeacherController {
  static create = async (req: Request, res: Response) => {
    const teacher = await TeacherService.createTeacher(req.body);
    return sendSuccess(res, teacher, 'Teacher account created successfully', 201);
  };

  static update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const teacher = await TeacherService.updateTeacher(id, req.body);

    if (!teacher) {
      return sendError(res, 'Teacher not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, teacher, 'Teacher details updated successfully');
  };

  static resetPassword = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { newPassword } = req.body;
    const teacher = await TeacherService.resetPassword(id, newPassword);

    if (!teacher) {
      return sendError(res, 'Teacher not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, null, 'Teacher password reset successfully');
  };

  static getProfile = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const teacher = await TeacherService.getTeacherById(id);

    if (!teacher) {
      return sendError(res, 'Teacher not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, teacher, 'Teacher profile fetched successfully');
  };

  static delete = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const deleted = await TeacherService.deleteTeacher(id);

    if (!deleted) {
      return sendError(res, 'Teacher not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, null, 'Teacher account deleted successfully');
  };

  static list = async (req: Request, res: Response) => {
    const { teachers, pagination } = await TeacherService.queryTeachers(req.query);
    return sendSuccess(res, teachers, 'Teachers listed successfully', 200, pagination);
  };
}
