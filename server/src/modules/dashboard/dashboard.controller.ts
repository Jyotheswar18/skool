import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { DashboardService } from './dashboard.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class DashboardController {
  static getAdminKpis = async (req: AuthRequest, res: Response) => {
    try {
      const data = await DashboardService.getAdminKpis();
      return sendSuccess(res, data, 'Admin dashboard metrics fetched successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to aggregate admin dashboard', 500);
    }
  };

  static getTeacherKpis = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?._id;
    if (!teacherId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    try {
      const data = await DashboardService.getTeacherKpis(teacherId);
      return sendSuccess(res, data, 'Teacher dashboard metrics fetched successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to aggregate teacher dashboard', 500);
    }
  };
}
