const express = require('express');
const router = express.Router();
const {
    getProducts,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

// Public
router.get('/', getProducts);

// Admin routes — no JWT guard (admin panel protected by localStorage check)
router.get('/admin', getAdminProducts);
router.post('/admin', createProduct);
router.put('/admin/:id', updateProduct);
router.delete('/admin/:id', deleteProduct);

module.exports = router;
