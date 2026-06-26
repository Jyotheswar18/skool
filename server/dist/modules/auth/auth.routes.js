"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_validation_1 = require("./auth.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_1.validateRequest)(auth_validation_1.loginSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.login));
router.post('/refresh', (0, validate_middleware_1.validateRequest)(auth_validation_1.refreshTokenSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.refresh));
router.post('/logout', (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.logout));
router.get('/me', auth_middleware_1.protectRoute, (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.getMe));
router.put('/change-password', auth_middleware_1.protectRoute, (0, validate_middleware_1.validateRequest)(auth_validation_1.changePasswordSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.changePassword));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map