"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const attendance_validation_1 = require("./attendance.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection to all attendance routes
router.use(auth_middleware_1.protectRoute);
router.post('/', (0, validate_middleware_1.validateRequest)(attendance_validation_1.markAttendanceSchema), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.AttendanceController.mark));
router.get('/', (0, validate_middleware_1.validateRequest)(attendance_validation_1.getAttendanceSchema), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.AttendanceController.list));
// Admin-only report extraction
router.get('/report', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(attendance_validation_1.getAttendanceReportSchema), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.AttendanceController.report));
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map