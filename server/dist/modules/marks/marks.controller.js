"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarksController = void 0;
const student_model_1 = require("../student/student.model");
const marks_model_1 = require("./marks.model");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class MarksController {
}
exports.MarksController = MarksController;
_a = MarksController;
/**
 * Get all students in a class/section with their existing marks (if any)
 */
MarksController.getStudentsWithMarks = async (req, res) => {
    const teacherId = req.user?._id;
    const teacherRole = req.user?.role;
    const { class: cls, section: sec, subject, examName } = req.query;
    // If teacher, check authorization for the class and section
    if (teacherRole === 'teacher') {
        const assignedClasses = (req.user?.assignedClasses || []).map((c) => c.trim());
        const assignedSections = (req.user?.assignedSections || []).map((s) => s.trim().toUpperCase());
        if (!assignedClasses.includes(cls) || !assignedSections.includes(sec.toUpperCase())) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized: You are not assigned to this class and section', 403, 'UNAUTHORIZED_CLASS_ACCESS');
        }
    }
    try {
        // 1. Fetch active students in class & section
        const students = await student_model_1.Student.find({
            class: cls,
            section: sec,
            status: 'active',
        }).sort({ name: 1 });
        // 2. Fetch existing marks for this exam & subject
        const existingMarks = await marks_model_1.Marks.find({
            class: cls,
            section: sec,
            subject,
            examName,
        });
        // 3. Map students to their marks
        const studentMarksList = students.map((student) => {
            const markLog = existingMarks.find((m) => m.student.toString() === student._id.toString());
            return {
                studentId: student._id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                marksObtained: markLog ? markLog.marksObtained : null,
                comments: markLog ? markLog.comments : '',
                maxMarks: markLog ? markLog.maxMarks : 100,
            };
        });
        return (0, apiResponse_1.sendSuccess)(res, {
            class: cls,
            section: sec,
            subject,
            examName,
            students: studentMarksList,
        }, 'Students and existing marks fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to fetch student marks', 500);
    }
};
/**
 * Upload or update marks in bulk for a class/section
 */
MarksController.uploadMarks = async (req, res) => {
    const teacherId = req.user?._id;
    const teacherRole = req.user?.role;
    const { class: cls, section: sec, subject, examName, maxMarks, students } = req.body;
    if (!teacherId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    // If teacher, check authorization for the class and section
    if (teacherRole === 'teacher') {
        const assignedClasses = (req.user?.assignedClasses || []).map((c) => c.trim());
        const assignedSections = (req.user?.assignedSections || []).map((s) => s.trim().toUpperCase());
        if (!assignedClasses.includes(cls) || !assignedSections.includes(sec.toUpperCase())) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized: You are not assigned to this class and section', 403, 'UNAUTHORIZED_CLASS_ACCESS');
        }
    }
    try {
        const bulkOperations = students.map((s) => {
            if (s.marksObtained > maxMarks) {
                throw new Error(`Marks obtained (${s.marksObtained}) cannot exceed maximum marks (${maxMarks})`);
            }
            return marks_model_1.Marks.findOneAndUpdate({
                student: s.studentId,
                examName,
                subject,
            }, {
                class: cls,
                section: sec,
                subject,
                examName,
                maxMarks,
                marksObtained: s.marksObtained,
                comments: s.comments || '',
                uploadedBy: teacherId,
            }, { upsert: true, new: true, runValidators: true });
        });
        await Promise.all(bulkOperations);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Marks uploaded successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to upload marks', 400);
    }
};
//# sourceMappingURL=marks.controller.js.map