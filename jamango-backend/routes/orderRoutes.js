const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAdminOrders,
    updateOrderStatus,
    getMyOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Public — create order from checkout (COD or post-Razorpay)
router.post('/', createOrder);

// Private — user's own orders (still needs user JWT)
router.get('/mine', protect, getMyOrders);

// Admin routes — no JWT guard (admin panel protected by localStorage check)
router.get('/admin', getAdminOrders);
router.put('/admin/:id/status', updateOrderStatus);

module.exports = router;
