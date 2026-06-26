"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marks_controller_1 = require("./marks.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const marks_validation_1 = require("./marks.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection to all marks routes
router.use(auth_middleware_1.protectRoute);
router.get('/students', (0, validate_middleware_1.validateRequest)(marks_validation_1.getStudentMarksSchema), (0, asyncHandler_1.asyncHandler)(marks_controller_1.MarksController.getStudentsWithMarks));
router.post('/upload', (0, validate_middleware_1.validateRequest)(marks_validation_1.uploadMarksSchema), (0, asyncHandler_1.asyncHandler)(marks_controller_1.MarksController.uploadMarks));
exports.default = router;
//# sourceMappingURL=marks.routes.js.map