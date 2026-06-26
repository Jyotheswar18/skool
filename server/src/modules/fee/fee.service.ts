import mongoose from 'mongoose';
import { Installment, IInstallmentDocument } from './installment.model';
import { Student } from '../student/student.model';
import { NotificationService } from '../notification/notification.service';
import { AttendanceService } from '../attendance/attendance.service';

export class FeeService {
  /**
   * Record payment for an installment
   */
  static payInstallment = async (
    installmentId: string,
    notes: string | undefined,
    adminId: string
  ): Promise<IInstallmentDocument | null> => {
    const installment = await Installment.findById(installmentId);
    if (!installment) return null;

    if (installment.status === 'paid') {
      throw new Error('Installment is already paid.');
    }

    installment.status = 'paid';
    installment.paidDate = new Date();
    installment.notes = notes;
    installment.markedBy = new mongoose.Types.ObjectId(adminId);
    await installment.save();

    return installment;
  };

  /**
   * Get installments list for a student
   */
  static getStudentInstallments = async (studentId: string): Promise<IInstallmentDocument[]> => {
    return Installment.find({ student: new mongoose.Types.ObjectId(studentId) }).sort({
      installmentNumber: 1,
    });
  };

  /**
   * Cron helper to scan pending installments past their due date and flag them as overdue
   */
  static markPendingAsOverdue = async (): Promise<number> => {
    const todayMidnight = AttendanceService.normalizeDate(new Date());

    const result = await Installment.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: todayMidnight },
      },
      {
        $set: { status: 'overdue' },
      }
    );

    console.log(`🧹 Fee Overdue Marker processed. Updated ${result.modifiedCount} installments to overdue.`);
    return result.modifiedCount;
  };

  /**
   * Scans and queues SMS reminders based on due dates
   */
  static sendScheduledReminders = async (): Promise<void> => {
    const today = AttendanceService.normalizeDate(new Date());

    // 1. Due Today Reminders
    const dueToday = await Installment.find({
      status: 'pending',
      dueDate: today,
    }).populate('student');

    for (const inst of dueToday) {
      const student = inst.student as any;
      if (!student || student.status !== 'active') continue;

      const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      NotificationService.sendFeeReminder({
        studentName: student.name,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        parentEmail: student.parentEmail,
        studentId: student._id.toString(),
        installmentId: inst._id.toString(),
        amount: inst.amount,
        dueDateStr: dateStr,
        installmentNumber: inst.installmentNumber,
        reminderType: 'due_today',
      }).catch((err) => console.error('Failed to send due today reminder:', err));
    }

    // 2. Upcoming Reminders (3 days prior)
    const threeDaysLater = new Date(today);
    threeDaysLater.setUTCDate(today.getUTCDate() + 3);

    const upcoming = await Installment.find({
      status: 'pending',
      dueDate: threeDaysLater,
    }).populate('student');

    for (const inst of upcoming) {
      const student = inst.student as any;
      if (!student || student.status !== 'active') continue;

      const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      NotificationService.sendFeeReminder({
        studentName: student.name,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        parentEmail: student.parentEmail,
        studentId: student._id.toString(),
        installmentId: inst._id.toString(),
        amount: inst.amount,
        dueDateStr: dateStr,
        installmentNumber: inst.installmentNumber,
        reminderType: 'upcoming',
      }).catch((err) => console.error('Failed to send upcoming reminder:', err));
    }

    // 3. Overdue Reminders (weekly alert)
    const overdue = await Installment.find({
      status: 'overdue',
    }).populate('student');

    for (const inst of overdue) {
      const student = inst.student as any;
      if (!student || student.status !== 'active') continue;

      const diffTime = Math.abs(today.getTime() - inst.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      NotificationService.sendFeeReminder({
        studentName: student.name,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        parentEmail: student.parentEmail,
        studentId: student._id.toString(),
        installmentId: inst._id.toString(),
        amount: inst.amount,
        dueDateStr: dateStr,
        installmentNumber: inst.installmentNumber,
        reminderType: 'overdue',
        daysOverdue: diffDays,
      }).catch((err) => console.error('Failed to send overdue reminder:', err));
    }
  };

  /**
   * Generates collections reports for fee dashboard
   */
  static getFeeReport = async (filters: {
    class?: string;
    section?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    // Build query filter
    const matchStage: any = {};

    if (filters.status) {
      matchStage.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      matchStage.dueDate = {};
      if (filters.startDate) {
        matchStage.dueDate.$gte = AttendanceService.normalizeDate(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.dueDate.$lte = AttendanceService.normalizeDate(filters.endDate);
      }
    }

    // Pipeline to aggregate totals
    const summaryPipeline: any[] = [{ $match: matchStage }];

    // If filtering by class/section, we must join student details first
    if (filters.class || filters.section) {
      summaryPipeline.push(
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo',
          },
        },
        { $unwind: '$studentInfo' }
      );

      if (filters.class) {
        summaryPipeline.push({ $match: { 'studentInfo.class': filters.class } });
      }
      if (filters.section) {
        summaryPipeline.push({
          $match: { 'studentInfo.section': filters.section.toUpperCase() },
        });
      }
    }

    summaryPipeline.push({
      $group: {
        _id: null,
        totalExpected: { $sum: '$amount' },
        collected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0] } },
      },
    });

    const summaryResult = await Installment.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalExpected: 0,
      collected: 0,
      pending: 0,
      overdue: 0,
    };

    // Class wise collection details
    const classWisePipeline: any[] = [
      { $match: { status: 'paid' } },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.class',
          collected: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const classWiseResult = await Installment.aggregate(classWisePipeline);

    return {
      summary,
      classWise: classWiseResult.map((item) => ({
        class: item._id,
        collected: item.collected,
      })),
    };
  };

  /**
   * List all overdue installments
   */
  static getOverdueInstallments = async () => {
    return Installment.find({ status: 'overdue' })
      .populate('student', 'name class section admissionNumber parentName parentMobile')
      .sort({ dueDate: 1 });
  };

  /**
   * Get ALL active students with their aggregated fee status for the fee board
   */
  static getAllStudentsWithFeeStatus = async (filters: {
    class?: string;
    section?: string;
    search?: string;
  }) => {
    // Build student filter
    const studentFilter: any = { status: 'active' };
    if (filters.class) studentFilter.class = filters.class;
    if (filters.section) studentFilter.section = filters.section.toUpperCase();
    if (filters.search) {
      studentFilter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { admissionNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const students = await Student.find(studentFilter)
      .sort({ class: 1, section: 1, name: 1 })
      .select('name admissionNumber class section totalFee numberOfInstallments feeEndDate parentName parentMobile joiningDate');

    // Fetch all installments for these students in bulk
    const studentIds = students.map((s) => s._id);
    const allInstallments = await Installment.find({
      student: { $in: studentIds },
    }).sort({ installmentNumber: 1 });

    // Group installments by student
    const installmentMap = new Map<string, any[]>();
    allInstallments.forEach((inst) => {
      const sid = inst.student.toString();
      if (!installmentMap.has(sid)) installmentMap.set(sid, []);
      installmentMap.get(sid)!.push(inst);
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = students.map((student) => {
      const installments = installmentMap.get(student._id.toString()) || [];

      const paidAmount = installments
        .filter((i) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + i.amount, 0);
      const pendingAmount = installments
        .filter((i) => i.status === 'pending')
        .reduce((sum: number, i: any) => sum + i.amount, 0);
      const overdueAmount = installments
        .filter((i) => i.status === 'overdue')
        .reduce((sum: number, i: any) => sum + i.amount, 0);

      // Find next upcoming installment (first pending/overdue)
      const nextInstallment = installments.find(
        (i) => i.status === 'pending' || i.status === 'overdue'
      );

      // Determine overall status
      let feeStatus: 'fully_paid' | 'partial' | 'unpaid' | 'overdue' = 'unpaid';
      if (paidAmount >= student.totalFee) {
        feeStatus = 'fully_paid';
      } else if (overdueAmount > 0) {
        feeStatus = 'overdue';
      } else if (paidAmount > 0) {
        feeStatus = 'partial';
      }

      return {
        _id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.class,
        section: student.section,
        totalFee: student.totalFee,
        numberOfInstallments: student.numberOfInstallments,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        paidAmount,
        pendingAmount,
        overdueAmount,
        feeStatus,
        nextInstallment: nextInstallment
          ? {
              installmentNumber: nextInstallment.installmentNumber,
              amount: nextInstallment.amount,
              dueDate: nextInstallment.dueDate,
              status: nextInstallment.status,
            }
          : null,
        paidCount: installments.filter((i) => i.status === 'paid').length,
        totalInstallments: installments.length,
      };
    });

    return result;
  };

  /**
   * Send a manual SMS fee reminder for a specific installment
   */
  static sendManualFeeReminder = async (installmentId: string) => {
    const installment = await Installment.findById(installmentId).populate('student');
    if (!installment) {
      throw new Error('Installment not found');
    }

    const student = installment.student as any;
    if (!student || student.status !== 'active') {
      throw new Error('Student not found or inactive');
    }

    if (installment.status === 'paid') {
      throw new Error('This installment is already paid');
    }

    const dateStr = installment.dueDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const reminderType = installment.status === 'overdue' ? 'overdue' : 'due_today';
    const daysOverdue =
      installment.status === 'overdue'
        ? Math.ceil(
            Math.abs(new Date().getTime() - installment.dueDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : undefined;

    await NotificationService.sendFeeReminder({
      studentName: student.name,
      parentName: student.parentName,
      parentMobile: student.parentMobile,
      parentEmail: student.parentEmail,
      studentId: student._id.toString(),
      installmentId: installment._id.toString(),
      amount: installment.amount,
      dueDateStr: dateStr,
      installmentNumber: installment.installmentNumber,
      reminderType,
      daysOverdue,
    });

    const channelName = student.parentEmail ? 'Email' : 'SMS';
    return { success: true, message: `${channelName} reminder sent to ${student.parentName} (${student.parentEmail || student.parentMobile})` };
  };
}
