"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const teacher_service_1 = require("./teacher.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class TeacherController {
}
exports.TeacherController = TeacherController;
_a = TeacherController;
TeacherController.create = async (req, res) => {
    const teacher = await teacher_service_1.TeacherService.createTeacher(req.body);
    return (0, apiResponse_1.sendSuccess)(res, teacher, 'Teacher account created successfully', 201);
};
TeacherController.update = async (req, res) => {
    const id = req.params.id;
    const teacher = await teacher_service_1.TeacherService.updateTeacher(id, req.body);
    if (!teacher) {
        return (0, apiResponse_1.sendError)(res, 'Teacher not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, teacher, 'Teacher details updated successfully');
};
TeacherController.resetPassword = async (req, res) => {
    const id = req.params.id;
    const { newPassword } = req.body;
    const teacher = await teacher_service_1.TeacherService.resetPassword(id, newPassword);
    if (!teacher) {
        return (0, apiResponse_1.sendError)(res, 'Teacher not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, null, 'Teacher password reset successfully');
};
TeacherController.getProfile = async (req, res) => {
    const id = req.params.id;
    const teacher = await teacher_service_1.TeacherService.getTeacherById(id);
    if (!teacher) {
        return (0, apiResponse_1.sendError)(res, 'Teacher not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, teacher, 'Teacher profile fetched successfully');
};
TeacherController.delete = async (req, res) => {
    const id = req.params.id;
    const deleted = await teacher_service_1.TeacherService.deleteTeacher(id);
    if (!deleted) {
        return (0, apiResponse_1.sendError)(res, 'Teacher not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, null, 'Teacher account deleted successfully');
};
TeacherController.list = async (req, res) => {
    const { teachers, pagination } = await teacher_service_1.TeacherService.queryTeachers(req.query);
    return (0, apiResponse_1.sendSuccess)(res, teachers, 'Teachers listed successfully', 200, pagination);
};
//# sourceMappingURL=teacher.controller.js.map