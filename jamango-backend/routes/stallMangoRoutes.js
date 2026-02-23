const express = require('express');
const router = express.Router();
const {
    getStallMangoes,
    getGlobalTemplates,
    addStallMango,
    updateStallMango,
    deleteStallMango,
} = require('../controllers/stallMangoController');
const { protect, admin, stallOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, stallOrAdmin, getStallMangoes)
    .post(protect, stallOrAdmin, addStallMango);

router.get('/templates', protect, stallOrAdmin, getGlobalTemplates);

router.route('/:id')
    .put(protect, stallOrAdmin, updateStallMango)
    .delete(protect, stallOrAdmin, deleteStallMango);

module.exports = router;
