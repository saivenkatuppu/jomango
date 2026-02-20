const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesReport } = require('../controllers/analyticsController');

const { protect, adminOrStaff } = require('../middleware/authMiddleware');

// GET /api/analytics/stats — protected for admin and staff
router.get('/stats', protect, adminOrStaff, getDashboardStats);

// GET /api/analytics/report
router.get('/report', protect, adminOrStaff, getSalesReport);

module.exports = router;
