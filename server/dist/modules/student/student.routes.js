"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const student_validation_1 = require("./student.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth to all student routes
router.use(auth_middleware_1.protectRoute);
router.get('/', (0, validate_middleware_1.validateRequest)(student_validation_1.queryStudentsSchema), (0, asyncHandler_1.asyncHandler)(student_controller_1.StudentController.list));
router.get('/:id', (0, validate_middleware_1.validateRequest)(student_validation_1.getStudentSchema), (0, asyncHandler_1.asyncHandler)(student_controller_1.StudentController.getProfile));
// Admin-only write routes
router.post('/', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(student_validation_1.createStudentSchema), (0, asyncHandler_1.asyncHandler)(student_controller_1.StudentController.create));
router.put('/:id', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(student_validation_1.updateStudentSchema), (0, asyncHandler_1.asyncHandler)(student_controller_1.StudentController.update));
router.delete('/:id', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(student_validation_1.getStudentSchema), (0, asyncHandler_1.asyncHandler)(student_controller_1.StudentController.delete));
exports.default = router;
//# sourceMappingURL=student.routes.js.map