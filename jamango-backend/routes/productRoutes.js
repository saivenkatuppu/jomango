const express = require('express');
const router = express.Router();
const {
    getProducts,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getInventoryLogs,
} = require('../controllers/productController');

const { protect, admin, adminOrStaff, stallOrAdmin, checkStallLock } = require('../middleware/authMiddleware');

// Public
router.get('/', getProducts);

// Admin / Staff / Stall routes
router.get('/admin', protect, stallOrAdmin, getAdminProducts);
router.get('/admin/inventory-logs', protect, adminOrStaff, getInventoryLogs);
router.post('/admin', protect, admin, createProduct);
router.put('/admin/:id', protect, stallOrAdmin, checkStallLock, updateProduct);
router.delete('/admin/:id', protect, admin, deleteProduct);

module.exports = router;
