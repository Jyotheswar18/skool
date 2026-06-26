import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { AttendanceService } from './attendance.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class AttendanceController {
  static mark = async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { class: classVal, section, date, records } = req.body;

    // Check if Teacher has permission for this class/section
    if (userRole === 'teacher') {
      const normalizedClasses = req.user?.assignedClasses.map((c: string) => c.trim()) || [];
      const normalizedSections = req.user?.assignedSections.map((s: string) => s.trim().toUpperCase()) || [];
      const isAssignedClass = normalizedClasses.includes(classVal);
      const isAssignedSection = normalizedSections.includes(section.toUpperCase());

      if (!isAssignedClass || !isAssignedSection) {
        return sendError(
          res,
          'Access denied. You can only mark attendance for your assigned class and section.',
          403,
          'FORBIDDEN'
        );
      }
    }

    try {
      const isTeacher = userRole === 'teacher';
      const results = await AttendanceService.markAttendance(
        classVal,
        section,
        date,
        records,
        userId,
        isTeacher
      );
      return sendSuccess(res, results, 'Attendance saved successfully', 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to save attendance', 400);
    }
  };

  static list = async (req: AuthRequest, res: Response) => {
    const filters: any = { ...req.query };
    const userRole = req.user?.role;

    // Restrict list to Teacher's assigned classes/sections
    if (userRole === 'teacher') {
      const normalizedClasses = req.user?.assignedClasses.map((c: string) => c.trim()) || [];
      const normalizedSections = req.user?.assignedSections.map((s: string) => s.trim().toUpperCase()) || [];

      if (filters.class && !normalizedClasses.includes(filters.class)) {
        return sendError(res, 'Access denied to this class history', 403, 'FORBIDDEN');
      }
      if (filters.section && !normalizedSections.includes(filters.section.toUpperCase())) {
        return sendError(res, 'Access denied to this section history', 403, 'FORBIDDEN');
      }

      // Default to scopes if none provided
      if (!filters.class) {
        filters.class = { $in: normalizedClasses };
      }
      if (!filters.section) {
        filters.section = { $in: normalizedSections };
      }
    }

    const logs = await AttendanceService.queryAttendance(filters);
    return sendSuccess(res, logs, 'Attendance logs fetched successfully');
  };

  static report = async (req: AuthRequest, res: Response) => {
    const { class: classVal, section, startDate, endDate } = req.query as any;

    const reportData = await AttendanceService.generateReport(
      classVal,
      section,
      startDate,
      endDate
    );

    return sendSuccess(res, reportData, 'Attendance report generated successfully');
  };
}
