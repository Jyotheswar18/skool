"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_controller_1 = require("./config.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const schoolConfig_validation_1 = require("./schoolConfig.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection to all configuration routes
router.use(auth_middleware_1.protectRoute);
router.get('/', (0, asyncHandler_1.asyncHandler)(config_controller_1.ConfigController.get));
router.put('/', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(schoolConfig_validation_1.updateConfigSchema), (0, asyncHandler_1.asyncHandler)(config_controller_1.ConfigController.update));
exports.default = router;
//# sourceMappingURL=config.routes.js.map