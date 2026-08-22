import { Router } from 'express';
import {
  getTodayStatus,
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  markAttendance
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.use(authenticateToken);

router.get('/today', getTodayStatus);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);
router.get('/all', requireAdmin, getAllAttendance);
router.post('/mark', requireAdmin, markAttendance);

export default router;
