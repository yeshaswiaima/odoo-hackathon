import { Router } from 'express';
import {
  getMyPayroll,
  getAllPayroll,
  updateSalaryStructure,
  getPayslipDetails
} from '../controllers/payrollController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.use(authenticateToken);

router.get('/my', getMyPayroll);
router.get('/payslip/:id', getPayslipDetails);
router.get('/all', requireAdmin, getAllPayroll);
router.put('/salary/:id', requireAdmin, updateSalaryStructure);

export default router;
