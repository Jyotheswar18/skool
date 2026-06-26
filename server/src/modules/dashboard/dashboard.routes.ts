import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection to all dashboard routes
router.use(protectRoute);

router.get(
  '/admin',
  requireRole('admin'),
  asyncHandler(DashboardController.getAdminKpis)
);

router.get(
  '/teacher',
  requireRole('teacher'),
  asyncHandler(DashboardController.getTeacherKpis)
);

export default router;
