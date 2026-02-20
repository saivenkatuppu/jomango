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

const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');

// Public
router.get('/', getProducts);

// Admin / Staff routes
router.get('/admin', protect, adminOrStaff, getAdminProducts);
router.get('/admin/inventory-logs', protect, adminOrStaff, getInventoryLogs);
router.post('/admin', protect, admin, createProduct);
router.put('/admin/:id', protect, adminOrStaff, updateProduct);
router.delete('/admin/:id', protect, admin, deleteProduct);

module.exports = router;
