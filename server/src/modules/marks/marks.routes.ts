import { Router } from 'express';
import { MarksController } from './marks.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { getStudentMarksSchema, uploadMarksSchema } from './marks.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection to all marks routes
router.use(protectRoute);

router.get(
  '/students',
  validateRequest(getStudentMarksSchema),
  asyncHandler(MarksController.getStudentsWithMarks)
);

router.post(
  '/upload',
  validateRequest(uploadMarksSchema),
  asyncHandler(MarksController.uploadMarks)
);

export default router;
