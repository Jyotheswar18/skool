"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class StudentController {
}
exports.StudentController = StudentController;
_a = StudentController;
StudentController.create = async (req, res) => {
    const creatorId = req.user?._id;
    if (!creatorId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const student = await student_service_1.StudentService.createStudent(req.body, creatorId);
    return (0, apiResponse_1.sendSuccess)(res, student, 'Student created successfully', 201);
};
StudentController.update = async (req, res) => {
    const id = req.params.id;
    const student = await student_service_1.StudentService.updateStudent(id, req.body);
    if (!student) {
        return (0, apiResponse_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, student, 'Student updated successfully');
};
StudentController.delete = async (req, res) => {
    const id = req.params.id;
    const deleted = await student_service_1.StudentService.deleteStudent(id);
    if (!deleted) {
        return (0, apiResponse_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, null, 'Student soft-deleted successfully');
};
StudentController.getProfile = async (req, res) => {
    const id = req.params.id;
    const profile = await student_service_1.StudentService.getStudentProfile(id);
    if (!profile) {
        return (0, apiResponse_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
    }
    // Role-based verification for teachers
    if (req.user?.role === 'teacher') {
        const isAssignedClass = req.user.assignedClasses.includes(profile.student.class);
        const isAssignedSection = req.user.assignedSections.includes(profile.student.section);
        if (!isAssignedClass || !isAssignedSection) {
            return (0, apiResponse_1.sendError)(res, 'Access denied. Student is not in your assigned class and section.', 403, 'FORBIDDEN');
        }
    }
    return (0, apiResponse_1.sendSuccess)(res, profile, 'Student profile fetched successfully');
};
StudentController.list = async (req, res) => {
    const query = { ...req.query };
    // Role-based restrictions for teachers
    if (req.user?.role === 'teacher') {
        // Normalize assigned arrays to uppercase for consistent comparison
        const normalizedClasses = req.user.assignedClasses.map((c) => c.trim());
        const normalizedSections = req.user.assignedSections.map((s) => s.trim().toUpperCase());
        // If teacher filters by class, ensure it's one of their assigned classes
        if (query.class && !normalizedClasses.includes(query.class.trim())) {
            return (0, apiResponse_1.sendError)(res, 'Access denied to this class', 403, 'FORBIDDEN');
        }
        // If teacher filters by section, ensure it's one of their assigned sections
        if (query.section && !normalizedSections.includes(query.section.trim().toUpperCase())) {
            return (0, apiResponse_1.sendError)(res, 'Access denied to this section', 403, 'FORBIDDEN');
        }
        // If no specific filters, default to teacher's scope
        if (!query.class) {
            query.class = { $in: normalizedClasses };
        }
        if (!query.section) {
            query.section = { $in: normalizedSections };
        }
    }
    const { students, pagination } = await student_service_1.StudentService.queryStudents(query);
    return (0, apiResponse_1.sendSuccess)(res, students, 'Students listed successfully', 200, pagination);
};
//# sourceMappingURL=student.controller.js.map