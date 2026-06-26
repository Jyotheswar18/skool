"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fee_controller_1 = require("./fee.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const fee_validation_1 = require("./fee.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection & admin requirement to all fee routes
router.use(auth_middleware_1.protectRoute);
router.use((0, role_middleware_1.requireRole)('admin'));
router.get('/report', (0, validate_middleware_1.validateRequest)(fee_validation_1.getFeeReportSchema), (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.report));
router.get('/overdue', (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.getOverdue));
router.get('/students', (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.getAllStudentsFeeBoard));
router.get('/students/:studentId/installments', (0, validate_middleware_1.validateRequest)(fee_validation_1.getStudentInstallmentsSchema), (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.getStudentInstallments));
router.put('/installments/:id/pay', (0, validate_middleware_1.validateRequest)(fee_validation_1.payInstallmentSchema), (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.pay));
router.post('/installments/:id/remind', (0, asyncHandler_1.asyncHandler)(fee_controller_1.FeeController.sendManualReminder));
exports.default = router;
//# sourceMappingURL=fee.routes.js.map