"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("./teacher.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const teacher_validation_1 = require("./teacher.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth to all teacher routes, restricted to admins
router.use(auth_middleware_1.protectRoute);
router.use((0, role_middleware_1.requireRole)('admin'));
router.get('/', (0, validate_middleware_1.validateRequest)(teacher_validation_1.queryTeachersSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.list));
router.get('/:id', (0, validate_middleware_1.validateRequest)(teacher_validation_1.getTeacherSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.getProfile));
router.post('/', (0, validate_middleware_1.validateRequest)(teacher_validation_1.createTeacherSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.create));
router.put('/:id', (0, validate_middleware_1.validateRequest)(teacher_validation_1.updateTeacherSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.update));
router.put('/:id/reset-password', (0, validate_middleware_1.validateRequest)(teacher_validation_1.resetTeacherPasswordSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.resetPassword));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(teacher_validation_1.getTeacherSchema), (0, asyncHandler_1.asyncHandler)(teacher_controller_1.TeacherController.delete));
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map