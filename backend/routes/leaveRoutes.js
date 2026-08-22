import { Router } from 'express';
import {
  getLeaveBalances,
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave
} from '../controllers/leaveController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.use(authenticateToken);

router.get('/balances', getLeaveBalances);
router.get('/my', getMyLeaves);
router.post('/apply', applyLeave);
router.get('/all', requireAdmin, getAllLeaves);
router.put('/:id/approve', requireAdmin, approveLeave);
router.put('/:id/reject', requireAdmin, rejectLeave);
router.delete('/:id', cancelLeave);

export default router;
