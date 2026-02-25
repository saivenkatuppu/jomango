const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesReport, getStallInventory } = require('../controllers/analyticsController');

const { protect, adminOrStaff } = require('../middleware/authMiddleware');

// GET /api/analytics/stats — protected for admin and staff
router.get('/stats', protect, adminOrStaff, getDashboardStats);

// GET /api/analytics/report
router.get('/report', protect, adminOrStaff, getSalesReport);

// GET /api/analytics/stall-inventory
router.get('/stall-inventory', protect, adminOrStaff, getStallInventory);

module.exports = router;
