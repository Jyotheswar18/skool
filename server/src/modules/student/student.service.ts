import mongoose from 'mongoose';
import { Student, IStudentDocument } from './student.model';
import { Installment } from '../fee/installment.model';
import { NotificationService } from '../notification/notification.service';
import { parsePagination, buildPaginationResult } from '../../shared/utils/pagination';
import { PaginationQuery } from '../../shared/types/common.types';

export class StudentService {
  /**
   * Create a new student, auto-generate installments, and send onboarding SMS message
   */
  static createStudent = async (studentData: any, creatorId: string): Promise<IStudentDocument> => {
    // 1. Save student record
    const student = new Student({
      ...studentData,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    });
    await student.save();

    try {
      // 2. Generate installment schedule
      const { totalFee, numberOfInstallments, joiningDate, feeEndDate } = student;
      const baseAmount = Math.floor(totalFee / numberOfInstallments);
      const remainder = totalFee % numberOfInstallments; // Add remainder to first installment

      const startDate = new Date(joiningDate);
      const endDate = feeEndDate ? new Date(feeEndDate) : (() => {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + 9); // 10-month school year: last installment falls 9 months after joining date
        return d;
      })();

      const totalDuration = endDate.getTime() - startDate.getTime();
      const intervalMs = numberOfInstallments > 1 ? totalDuration / (numberOfInstallments - 1) : 0;

      const installmentsToCreate = [];
      for (let i = 0; i < numberOfInstallments; i++) {
        let dueDate: Date;
        if (numberOfInstallments > 1) {
          dueDate = new Date(startDate.getTime() + intervalMs * i);
        } else {
          dueDate = new Date(startDate);
        }

        // Adjust amount to clear remainders
        const amount = i === 0 ? baseAmount + remainder : baseAmount;

        installmentsToCreate.push({
          student: student._id,
          installmentNumber: i + 1,
          amount,
          dueDate,
          status: 'pending',
        });
      }

      await Installment.insertMany(installmentsToCreate);

      // 3. Send Onboarding SMS welcome message to parent (Non-blocking async)
      NotificationService.sendWelcomeMessage(
        student.name,
        student.class,
        student.section,
        student.totalFee,
        student.numberOfInstallments,
        student.parentName,
        student.parentMobile,
        student._id.toString(),
        student.parentEmail
      ).catch((err) => console.error('Onboarding Welcome SMS failed:', err));

      return student;
    } catch (error) {
      // Rollback: remove the student if installment creation failed
      await Student.findByIdAndDelete(student._id);
      throw error;
    }
  };

  /**
   * Update student details
   */
  static updateStudent = async (id: string, updateData: any): Promise<IStudentDocument | null> => {
    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return student;
  };

  /**
   * Delete student (soft delete by marking as inactive or fully deleting depending on requirements)
   * For safety, we will soft delete (status -> inactive) and delete unpaid pending installments
   */
  static deleteStudent = async (id: string): Promise<boolean> => {
    const student = await Student.findById(id);
    if (!student) return false;

    // Change status to inactive
    student.status = 'inactive';
    await student.save();

    // Clean up pending and overdue installments
    await Installment.deleteMany({
      student: student._id,
      status: { $in: ['pending', 'overdue'] },
    });

    return true;
  };

  /**
   * Get student profile by ID along with installment schedule and attendance summary
   */
  static getStudentProfile = async (id: string) => {
    const student = await Student.findById(id).populate('createdBy', 'name email');
    if (!student) return null;

    const installments = await Installment.find({ student: student._id }).sort({ installmentNumber: 1 });

    // Fetch attendance summary using mongo aggregation
    const attendanceStats = await mongoose.model('Attendance').aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
    ]);

    const attendanceSummary = attendanceStats[0] || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
    };

    const attendancePercentage =
      attendanceSummary.total > 0
        ? Math.round(((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.total) * 100)
        : 100;

    return {
      student,
      installments,
      attendanceSummary: {
        ...attendanceSummary,
        percentage: attendancePercentage,
      },
    };
  };

  /**
   * Search, filter, and paginate students
   */
  static queryStudents = async (query: PaginationQuery & { search?: string; class?: string; section?: string; status?: string }) => {
    const { page, limit, skip, sortBy, order } = parsePagination(query, { sortBy: 'name', limit: 20 });

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.class) {
      filter.class = query.class;
    }

    if (query.section) {
      filter.section = query.section.toUpperCase();
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { admissionNumber: { $regex: query.search, $options: 'i' } },
        { parentName: { $regex: query.search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const paginationResult = buildPaginationResult(page, limit, total);

    return { students, pagination: paginationResult };
  };
}
