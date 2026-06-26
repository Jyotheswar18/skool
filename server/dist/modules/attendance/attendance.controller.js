"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class AttendanceController {
}
exports.AttendanceController = AttendanceController;
_a = AttendanceController;
AttendanceController.mark = async (req, res) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const { class: classVal, section, date, records } = req.body;
    // Check if Teacher has permission for this class/section
    if (userRole === 'teacher') {
        const normalizedClasses = req.user?.assignedClasses.map((c) => c.trim()) || [];
        const normalizedSections = req.user?.assignedSections.map((s) => s.trim().toUpperCase()) || [];
        const isAssignedClass = normalizedClasses.includes(classVal);
        const isAssignedSection = normalizedSections.includes(section.toUpperCase());
        if (!isAssignedClass || !isAssignedSection) {
            return (0, apiResponse_1.sendError)(res, 'Access denied. You can only mark attendance for your assigned class and section.', 403, 'FORBIDDEN');
        }
    }
    try {
        const isTeacher = userRole === 'teacher';
        const results = await attendance_service_1.AttendanceService.markAttendance(classVal, section, date, records, userId, isTeacher);
        return (0, apiResponse_1.sendSuccess)(res, results, 'Attendance saved successfully', 200);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to save attendance', 400);
    }
};
AttendanceController.list = async (req, res) => {
    const filters = { ...req.query };
    const userRole = req.user?.role;
    // Restrict list to Teacher's assigned classes/sections
    if (userRole === 'teacher') {
        const normalizedClasses = req.user?.assignedClasses.map((c) => c.trim()) || [];
        const normalizedSections = req.user?.assignedSections.map((s) => s.trim().toUpperCase()) || [];
        if (filters.class && !normalizedClasses.includes(filters.class)) {
            return (0, apiResponse_1.sendError)(res, 'Access denied to this class history', 403, 'FORBIDDEN');
        }
        if (filters.section && !normalizedSections.includes(filters.section.toUpperCase())) {
            return (0, apiResponse_1.sendError)(res, 'Access denied to this section history', 403, 'FORBIDDEN');
        }
        // Default to scopes if none provided
        if (!filters.class) {
            filters.class = { $in: normalizedClasses };
        }
        if (!filters.section) {
            filters.section = { $in: normalizedSections };
        }
    }
    const logs = await attendance_service_1.AttendanceService.queryAttendance(filters);
    return (0, apiResponse_1.sendSuccess)(res, logs, 'Attendance logs fetched successfully');
};
AttendanceController.report = async (req, res) => {
    const { class: classVal, section, startDate, endDate } = req.query;
    const reportData = await attendance_service_1.AttendanceService.generateReport(classVal, section, startDate, endDate);
    return (0, apiResponse_1.sendSuccess)(res, reportData, 'Attendance report generated successfully');
};
//# sourceMappingURL=attendance.controller.js.map