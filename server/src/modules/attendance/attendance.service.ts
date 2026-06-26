import mongoose from 'mongoose';
import { Attendance, IAttendanceDocument } from './attendance.model';
import { Student } from '../student/student.model';
import { NotificationService } from '../notification/notification.service';

export class AttendanceService {
  /**
   * Helper to normalize a date to midnight UTC
   */
  static normalizeDate = (dateInput: string | Date): Date => {
    const d = new Date(dateInput);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  /**
   * Bulk mark/edit student attendance
   */
  static markAttendance = async (
    classVal: string,
    section: string,
    dateStr: string,
    records: { student: string; status: 'present' | 'absent' | 'late' }[],
    markedById: string,
    isTeacher: boolean
  ): Promise<any[]> => {
    const attendanceDate = this.normalizeDate(dateStr);
    const today = this.normalizeDate(new Date());

    // Teacher check: Must be the SAME day to edit/mark
    if (isTeacher && attendanceDate.getTime() !== today.getTime()) {
      throw new Error('Teachers are only allowed to mark or edit attendance for the current day.');
    }

    const savedRecords: any[] = [];
    const teacherIdObj = new mongoose.Types.ObjectId(markedById);

    // Prepare bulk write operations for efficiency
    const bulkOps = records.map((record) => {
      const studentIdObj = new mongoose.Types.ObjectId(record.student);
      return {
        updateOne: {
          filter: { student: studentIdObj, date: attendanceDate },
          update: {
            $set: {
              class: classVal,
              section: section.toUpperCase(),
              status: record.status,
              markedBy: teacherIdObj,
            },
          },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(bulkOps);

    // Post-marking processes: Trigger absent alerts to parents
    // We can execute this asynchronously to prevent blocking the HTTP thread
    this.processAbsentAlerts(records, classVal, section, attendanceDate).catch((err) =>
      console.error('Error triggering absent alerts:', err)
    );

    // Fetch the updated records to return
    const results = await Attendance.find({
      class: classVal,
      section: section.toUpperCase(),
      date: attendanceDate,
    }).populate('student', 'name parentName parentMobile alternateMobile');

    return results;
  };

  /**
   * Asynchronously triggers WhatsApp alerts for absent students
   */
  private static processAbsentAlerts = async (
    records: { student: string; status: 'present' | 'absent' | 'late' }[],
    classVal: string,
    section: string,
    attendanceDate: Date
  ) => {
    const absentRecords = records.filter((r) => r.status === 'absent');
    if (absentRecords.length === 0) return;

    const dateStr = attendanceDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    for (const record of absentRecords) {
      const student = await Student.findById(record.student);
      if (!student || student.status !== 'active') continue;

      // Find the saved attendance ID
      const attRecord = await Attendance.findOne({ student: student._id, date: attendanceDate });
      if (!attRecord) continue;

      // Trigger absent alert
      NotificationService.sendAbsentAlert(
        student.name,
        student.class,
        student.section,
        student.parentName,
        student.parentMobile,
        dateStr,
        student._id.toString(),
        attRecord._id.toString()
      ).catch((err) => console.error(`Failed to send absent alert for ${student.name}:`, err));
    }
  };

  /**
   * List attendance logs based on filters
   */
  static queryAttendance = async (filters: {
    class?: string;
    section?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    student?: string;
  }): Promise<IAttendanceDocument[]> => {
    const filterObj: any = {};

    if (filters.class) {
      filterObj.class = filters.class;
    }
    if (filters.section) {
      filterObj.section = filters.section.toUpperCase();
    }
    if (filters.student) {
      filterObj.student = new mongoose.Types.ObjectId(filters.student);
    }

    if (filters.date) {
      filterObj.date = this.normalizeDate(filters.date);
    } else if (filters.startDate || filters.endDate) {
      filterObj.date = {};
      if (filters.startDate) {
        filterObj.date.$gte = this.normalizeDate(filters.startDate);
      }
      if (filters.endDate) {
        filterObj.date.$lte = this.normalizeDate(filters.endDate);
      }
    }

    return Attendance.find(filterObj)
      .populate('student', 'name admissionNumber class section parentName')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });
  };

  /**
   * Generate aggregated attendance reports for a class/section over a date range
   */
  static generateReport = async (
    classVal: string,
    section: string,
    startDateStr: string,
    endDateStr: string
  ) => {
    const start = this.normalizeDate(startDateStr);
    const end = this.normalizeDate(endDateStr);

    // Aggregate statistics
    const stats = await Attendance.aggregate([
      {
        $match: {
          class: classVal,
          section: section.toUpperCase(),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$student',
          totalDays: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
    ]);

    // Populate student names
    const populatedStats = await Promise.all(
      stats.map(async (stat) => {
        const student = await Student.findById(stat._id).select('name admissionNumber status');
        const attendancePercentage =
          stat.totalDays > 0 ? Math.round(((stat.present + stat.late) / stat.totalDays) * 100) : 0;

        return {
          student,
          totalDays: stat.totalDays,
          present: stat.present,
          absent: stat.absent,
          late: stat.late,
          percentage: attendancePercentage,
        };
      })
    );

    // Overall metrics
    const totalRecords = stats.reduce((sum, item) => sum + item.totalDays, 0);
    const totalPresent = stats.reduce((sum, item) => sum + item.present, 0);
    const totalLate = stats.reduce((sum, item) => sum + item.late, 0);
    const overallPercentage =
      totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 100;

    return {
      class: classVal,
      section: section.toUpperCase(),
      startDate: start,
      endDate: end,
      overallPercentage,
      studentStats: populatedStats,
    };
  };
}
