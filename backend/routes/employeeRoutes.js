import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments
} from '../controllers/employeeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.use(authenticateToken);

router.get('/departments', getDepartments);
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', requireAdmin, createEmployee);
router.put('/:id', updateEmployee); // Both self (limited) and admin (full) handled inside controller
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;
