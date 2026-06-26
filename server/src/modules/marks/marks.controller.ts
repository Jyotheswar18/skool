import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { Student } from '../student/student.model';
import { Marks } from './marks.model';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';
import { NotificationService } from '../notification/notification.service';

export class MarksController {
  /**
   * Get all students in a class/section with their existing marks (if any)
   */
  static getStudentsWithMarks = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?._id;
    const teacherRole = req.user?.role;
    const { class: cls, section: sec, subject, examName } = req.query as {
      class: string;
      section: string;
      subject: string;
      examName: string;
    };

    // If teacher, check authorization for the class and section
    if (teacherRole === 'teacher') {
      const assignedClasses = (req.user?.assignedClasses || []).map((c: string) => c.trim());
      const assignedSections = (req.user?.assignedSections || []).map((s: string) => s.trim().toUpperCase());

      if (!assignedClasses.includes(cls) || !assignedSections.includes(sec.toUpperCase())) {
        return sendError(
          res,
          'Unauthorized: You are not assigned to this class and section',
          403,
          'UNAUTHORIZED_CLASS_ACCESS'
        );
      }
    }

    try {
      // 1. Fetch active students in class & section
      const students = await Student.find({
        class: cls,
        section: sec,
        status: 'active',
      }).sort({ name: 1 });

      // 2. Fetch existing marks for this exam & subject
      const existingMarks = await Marks.find({
        class: cls,
        section: sec,
        subject,
        examName,
      });

      // 3. Map students to their marks
      const studentMarksList = students.map((student) => {
        const markLog = existingMarks.find(
          (m) => m.student.toString() === student._id.toString()
        );

        return {
          studentId: student._id,
          name: student.name,
          admissionNumber: student.admissionNumber,
          marksObtained: markLog ? markLog.marksObtained : null,
          comments: markLog ? markLog.comments : '',
          maxMarks: markLog ? markLog.maxMarks : 100,
        };
      });

      return sendSuccess(
        res,
        {
          class: cls,
          section: sec,
          subject,
          examName,
          students: studentMarksList,
        },
        'Students and existing marks fetched successfully'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch student marks', 500);
    }
  };

  /**
   * Upload or update marks in bulk for a class/section
   */
  static uploadMarks = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?._id;
    const teacherRole = req.user?.role;
    const { class: cls, section: sec, subject, examName, maxMarks, students } = req.body;

    if (!teacherId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    // If teacher, check authorization for the class and section
    if (teacherRole === 'teacher') {
      const assignedClasses = (req.user?.assignedClasses || []).map((c: string) => c.trim());
      const assignedSections = (req.user?.assignedSections || []).map((s: string) => s.trim().toUpperCase());

      if (!assignedClasses.includes(cls) || !assignedSections.includes(sec.toUpperCase())) {
        return sendError(
          res,
          'Unauthorized: You are not assigned to this class and section',
          403,
          'UNAUTHORIZED_CLASS_ACCESS'
        );
      }
    }

    try {
      const bulkOperations = students.map((s: any) => {
        if (s.marksObtained > maxMarks) {
          throw new Error(
            `Marks obtained (${s.marksObtained}) cannot exceed maximum marks (${maxMarks})`
          );
        }

        return Marks.findOneAndUpdate(
          {
            student: s.studentId,
            examName,
            subject,
          },
          {
            class: cls,
            section: sec,
            subject,
            examName,
            maxMarks,
            marksObtained: s.marksObtained,
            comments: s.comments || '',
            uploadedBy: teacherId,
          },
          { upsert: true, new: true, runValidators: true }
        );
      });

      const savedMarks = await Promise.all(bulkOperations);

      // Send email notifications to parents (non-blocking)
      const studentIds = students
        .filter((s: any) => s.marksObtained !== null && s.marksObtained !== undefined)
        .map((s: any) => s.studentId);

      if (studentIds.length > 0) {
        Student.find({ _id: { $in: studentIds }, status: 'active' })
          .then((studentRecords) => {
            for (const studentRecord of studentRecords) {
              const marksEntry = students.find(
                (s: any) => s.studentId === studentRecord._id.toString()
              );
              const savedMark = savedMarks.find(
                (m: any) => m && m.student.toString() === studentRecord._id.toString()
              );
              if (!marksEntry || marksEntry.marksObtained === null || marksEntry.marksObtained === undefined) continue;

              NotificationService.sendMarksAlert({
                studentName: studentRecord.name,
                parentName: studentRecord.parentName,
                parentMobile: studentRecord.parentMobile,
                parentEmail: studentRecord.parentEmail,
                studentId: studentRecord._id.toString(),
                marksId: savedMark ? savedMark._id.toString() : studentRecord._id.toString(),
                subject,
                examName,
                marksObtained: marksEntry.marksObtained,
                maxMarks,
                comments: marksEntry.comments || '',
                studentClass: cls,
                studentSection: sec,
              }).catch((err) => console.error(`Failed to send marks email for ${studentRecord.name}:`, err));
            }
          })
          .catch((err) => console.error('Failed to fetch students for marks notification:', err));
      }

      return sendSuccess(res, null, 'Marks uploaded successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to upload marks', 400);
    }
  };
}
