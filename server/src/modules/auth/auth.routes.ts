import { Router } from 'express';
import { AuthController } from './auth.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { loginSchema, changePasswordSchema, refreshTokenSchema } from './auth.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  asyncHandler(AuthController.refresh)
);

router.post(
  '/logout',
  asyncHandler(AuthController.logout)
);

router.get(
  '/me',
  protectRoute,
  asyncHandler(AuthController.getMe)
);

router.put(
  '/change-password',
  protectRoute,
  validateRequest(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

export default router;
