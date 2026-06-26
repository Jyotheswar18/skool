import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  markAttendanceSchema,
  getAttendanceSchema,
  getAttendanceReportSchema,
} from './attendance.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection to all attendance routes
router.use(protectRoute);

router.post(
  '/',
  validateRequest(markAttendanceSchema),
  asyncHandler(AttendanceController.mark)
);

router.get(
  '/',
  validateRequest(getAttendanceSchema),
  asyncHandler(AttendanceController.list)
);

// Admin-only report extraction
router.get(
  '/report',
  requireRole('admin'),
  validateRequest(getAttendanceReportSchema),
  asyncHandler(AttendanceController.report)
);

export default router;
