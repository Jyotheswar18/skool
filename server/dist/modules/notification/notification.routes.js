"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const notification_validation_1 = require("./notification.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection & admin requirement to all notification routes
router.use(auth_middleware_1.protectRoute);
router.use((0, role_middleware_1.requireRole)('admin'));
router.get('/', (0, validate_middleware_1.validateRequest)(notification_validation_1.queryNotificationsSchema), (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.list));
router.get('/stats', (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.getStats));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map