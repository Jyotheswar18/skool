import { Router } from 'express';
import { EventController } from './event.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { uploadMultiple } from '../../middleware/upload.middleware';
import {
  createEventSchema,
  updateEventSchema,
  getEventSchema,
  queryEventsSchema,
} from './event.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection to all event routes
router.use(protectRoute);

router.get(
  '/',
  validateRequest(queryEventsSchema),
  asyncHandler(EventController.list)
);

router.get(
  '/:id',
  validateRequest(getEventSchema),
  asyncHandler(EventController.getDetails)
);

// Admin-only write routes
router.post(
  '/',
  requireRole('admin'),
  validateRequest(createEventSchema),
  asyncHandler(EventController.create)
);

router.put(
  '/:id',
  requireRole('admin'),
  validateRequest(updateEventSchema),
  asyncHandler(EventController.update)
);

router.delete(
  '/:id',
  requireRole('admin'),
  validateRequest(getEventSchema),
  asyncHandler(EventController.delete)
);

router.post(
  '/:id/publish',
  requireRole('admin'),
  validateRequest(getEventSchema),
  asyncHandler(EventController.publish)
);

router.post(
  '/:id/media',
  requireRole('admin'),
  uploadMultiple('media', 5),
  asyncHandler(EventController.uploadMedia)
);

router.delete(
  '/:id/media/:mediaId',
  requireRole('admin'),
  asyncHandler(EventController.deleteMedia)
);

export default router;
