import { Router } from 'express';
import { FeeController } from './fee.controller';
import { protectRoute } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  payInstallmentSchema,
  getStudentInstallmentsSchema,
  getFeeReportSchema,
} from './fee.validation';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// Apply auth protection & admin requirement to all fee routes
router.use(protectRoute);
router.use(requireRole('admin'));

router.get(
  '/report',
  validateRequest(getFeeReportSchema),
  asyncHandler(FeeController.report)
);

router.get(
  '/overdue',
  asyncHandler(FeeController.getOverdue)
);

router.get(
  '/students',
  asyncHandler(FeeController.getAllStudentsFeeBoard)
);

router.get(
  '/students/:studentId/installments',
  validateRequest(getStudentInstallmentsSchema),
  asyncHandler(FeeController.getStudentInstallments)
);

router.put(
  '/installments/:id/pay',
  validateRequest(payInstallmentSchema),
  asyncHandler(FeeController.pay)
);

router.post(
  '/installments/:id/remind',
  asyncHandler(FeeController.sendManualReminder)
);

export default router;
