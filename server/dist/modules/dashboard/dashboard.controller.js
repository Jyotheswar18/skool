"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class DashboardController {
}
exports.DashboardController = DashboardController;
_a = DashboardController;
DashboardController.getAdminKpis = async (req, res) => {
    try {
        const data = await dashboard_service_1.DashboardService.getAdminKpis();
        return (0, apiResponse_1.sendSuccess)(res, data, 'Admin dashboard metrics fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to aggregate admin dashboard', 500);
    }
};
DashboardController.getTeacherKpis = async (req, res) => {
    const teacherId = req.user?._id;
    if (!teacherId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    try {
        const data = await dashboard_service_1.DashboardService.getTeacherKpis(teacherId);
        return (0, apiResponse_1.sendSuccess)(res, data, 'Teacher dashboard metrics fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to aggregate teacher dashboard', 500);
    }
};
//# sourceMappingURL=dashboard.controller.js.map