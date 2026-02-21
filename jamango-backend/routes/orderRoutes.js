const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAdminOrders,
    updateOrderStatus,
    getMyOrders,
    getMyOrderById,
    getShippingRate
} = require('../controllers/orderController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

// Public — create order from checkout (COD or post-Razorpay)
router.post('/', createOrder);
router.post('/shipping-rate', getShippingRate);

// Admin / Staff routes
router.get('/admin', protect, adminOrStaff, getAdminOrders);
router.put('/admin/:id/status', protect, adminOrStaff, updateOrderStatus);

// Private — user's own orders (still needs user JWT)
router.get('/mine', protect, getMyOrders);
router.get('/:id', protect, getMyOrderById);

module.exports = router;
