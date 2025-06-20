const express = require('express');
const router = express.Router();
const {
  getUsers,
  approveSeller,
  rejectSeller,
  getApprovedSellers,
  getPlatformFeeReport,
  getSalesPerformanceReport,
  getBookActivityReport,
} = require('../controllers/adminController');
const { getAllStats } = require('../controllers/statsController');
const authMiddleWare = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/users', authMiddleWare, roleMiddleware(['admin']), getUsers);
router.post(
  '/seller/approve/:id',
  authMiddleWare,
  roleMiddleware(['admin']),
  approveSeller
);
router.post(
  '/seller/reject/:id',
  authMiddleWare,
  roleMiddleware(['admin']),
  rejectSeller
);
router.get('/stats', authMiddleWare, roleMiddleware(['admin']), getAllStats);
router.get(
  '/sellers',
  authMiddleWare,
  roleMiddleware(['admin']),
  getApprovedSellers
);
router.get(
  '/get-platform-fee-report',
  authMiddleWare,
  roleMiddleware(['admin']),
  getPlatformFeeReport
);
router.get(
  '/get-sales-performance-report',
  authMiddleWare,
  roleMiddleware(['admin']),
  getSalesPerformanceReport
);
router.get(
  '/book-activity-report',
  authMiddleWare,
  roleMiddleware(['admin']),
  getBookActivityReport
);

module.exports = router;
