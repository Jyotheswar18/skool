import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { FeeService } from './fee.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class FeeController {
  static pay = async (req: AuthRequest, res: Response) => {
    const adminId = req.user?._id;
    if (!adminId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const id = req.params.id as string;
    const { notes } = req.body;

    try {
      const installment = await FeeService.payInstallment(id, notes, adminId);
      if (!installment) {
        return sendError(res, 'Installment not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, installment, 'Installment payment recorded successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Payment execution failed', 400);
    }
  };

  static getStudentInstallments = async (req: Request, res: Response) => {
    const studentId = req.params.studentId as string;
    const installments = await FeeService.getStudentInstallments(studentId);
    return sendSuccess(res, installments, 'Installments list fetched successfully');
  };

  static report = async (req: Request, res: Response) => {
    const reportData = await FeeService.getFeeReport(req.query as any);
    return sendSuccess(res, reportData, 'Fee collection report generated successfully');
  };

  static getOverdue = async (req: Request, res: Response) => {
    const overdueList = await FeeService.getOverdueInstallments();
    return sendSuccess(res, overdueList, 'Overdue installments fetched successfully');
  };

  static getAllStudentsFeeBoard = async (req: Request, res: Response) => {
    const { class: className, section, search } = req.query as any;
    const studentFeeBoard = await FeeService.getAllStudentsWithFeeStatus({
      class: className,
      section,
      search,
    });
    return sendSuccess(res, studentFeeBoard, 'Student fee board list fetched successfully');
  };

  static sendManualReminder = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await FeeService.sendManualFeeReminder(id);
    return sendSuccess(res, result, 'Fee reminder sent successfully');
  };
}
