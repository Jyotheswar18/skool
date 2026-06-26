import { Router } from 'express';
import { ConfigController } from './config.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { updateConfigSchema } from './schoolConfig.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection to all configuration routes
router.use(protectRoute);

router.get(
  '/',
  asyncHandler(ConfigController.get)
);

router.put(
  '/',
  requireRole('admin'),
  validateRequest(updateConfigSchema),
  asyncHandler(ConfigController.update)
);

export default router;
