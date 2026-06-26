"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("./event.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const event_validation_1 = require("./event.validation");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply auth protection to all event routes
router.use(auth_middleware_1.protectRoute);
router.get('/', (0, validate_middleware_1.validateRequest)(event_validation_1.queryEventsSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.list));
router.get('/:id', (0, validate_middleware_1.validateRequest)(event_validation_1.getEventSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.getDetails));
// Admin-only write routes
router.post('/', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(event_validation_1.createEventSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.create));
router.put('/:id', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(event_validation_1.updateEventSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.update));
router.delete('/:id', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(event_validation_1.getEventSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.delete));
router.post('/:id/publish', (0, role_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validateRequest)(event_validation_1.getEventSchema), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.publish));
router.post('/:id/media', (0, role_middleware_1.requireRole)('admin'), (0, upload_middleware_1.uploadMultiple)('media', 5), (0, asyncHandler_1.asyncHandler)(event_controller_1.EventController.uploadMedia));
exports.default = router;
//# sourceMappingURL=event.routes.js.map