import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { queryNotificationsSchema } from './notification.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection & admin requirement to all notification routes
router.use(protectRoute);
router.use(requireRole('admin'));

router.get(
  '/',
  validateRequest(queryNotificationsSchema),
  asyncHandler(NotificationController.list)
);

router.get(
  '/stats',
  asyncHandler(NotificationController.getStats)
);

export default router;
