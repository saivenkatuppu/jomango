const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');

// GET /api/analytics/stats — no auth guard (admin panel protected by localStorage)
router.get('/stats', getDashboardStats);

module.exports = router;
