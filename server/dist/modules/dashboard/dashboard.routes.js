"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection to all dashboard routes
router.use(auth_middleware_1.protectRoute);
router.get('/admin', (0, role_middleware_1.requireRole)('admin'), (0, asyncHandler_1.asyncHandler)(dashboard_controller_1.DashboardController.getAdminKpis));
router.get('/teacher', (0, role_middleware_1.requireRole)('teacher'), (0, asyncHandler_1.asyncHandler)(dashboard_controller_1.DashboardController.getTeacherKpis));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map