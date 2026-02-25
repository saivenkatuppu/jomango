const express = require('express');
const router = express.Router();
const {
    addCustomer,
    getCustomers,
    getCRMStats,
} = require('../controllers/crmController');
const { protect, admin, stallOrAdmin, checkStallLock } = require('../middleware/authMiddleware');

router.route('/customers')
    .post(protect, stallOrAdmin, addCustomer)
    .get(protect, stallOrAdmin, getCustomers);

router.get('/stats', protect, stallOrAdmin, getCRMStats);

module.exports = router;
