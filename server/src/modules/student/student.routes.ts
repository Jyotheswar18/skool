import { Router } from 'express';
import { StudentController } from './student.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createStudentSchema,
  updateStudentSchema,
  getStudentSchema,
  queryStudentsSchema,
} from './student.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth to all student routes
router.use(protectRoute);

router.get(
  '/',
  validateRequest(queryStudentsSchema),
  asyncHandler(StudentController.list)
);

router.get(
  '/:id',
  validateRequest(getStudentSchema),
  asyncHandler(StudentController.getProfile)
);

// Admin-only write routes
router.post(
  '/',
  requireRole('admin'),
  validateRequest(createStudentSchema),
  asyncHandler(StudentController.create)
);

router.put(
  '/:id',
  requireRole('admin'),
  validateRequest(updateStudentSchema),
  asyncHandler(StudentController.update)
);

router.delete(
  '/:id',
  requireRole('admin'),
  validateRequest(getStudentSchema),
  asyncHandler(StudentController.delete)
);

export default router;
