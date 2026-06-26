import { Router } from 'express';
import { TeacherController } from './teacher.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createTeacherSchema,
  updateTeacherSchema,
  resetTeacherPasswordSchema,
  getTeacherSchema,
  queryTeachersSchema,
} from './teacher.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth to all teacher routes, restricted to admins
router.use(protectRoute);
router.use(requireRole('admin'));

router.get(
  '/',
  validateRequest(queryTeachersSchema),
  asyncHandler(TeacherController.list)
);

router.get(
  '/:id',
  validateRequest(getTeacherSchema),
  asyncHandler(TeacherController.getProfile)
);

router.post(
  '/',
  validateRequest(createTeacherSchema),
  asyncHandler(TeacherController.create)
);

router.put(
  '/:id',
  validateRequest(updateTeacherSchema),
  asyncHandler(TeacherController.update)
);

router.put(
  '/:id/reset-password',
  validateRequest(resetTeacherPasswordSchema),
  asyncHandler(TeacherController.resetPassword)
);

router.delete(
  '/:id',
  validateRequest(getTeacherSchema),
  asyncHandler(TeacherController.delete)
);

export default router;
