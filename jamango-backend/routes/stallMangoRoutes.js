const express = require('express');
const router = express.Router();
const {
    getStallMangoes,
    getGlobalTemplates,
    addStallMango,
    updateStallMango,
    deleteStallMango,
} = require('../controllers/stallMangoController');
const { protect, admin, stallOrAdmin, checkStallLock } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, stallOrAdmin, getStallMangoes)
    .post(protect, stallOrAdmin, checkStallLock, addStallMango);

router.get('/templates', protect, stallOrAdmin, getGlobalTemplates);

router.route('/:id')
    .put(protect, stallOrAdmin, checkStallLock, updateStallMango)
    .delete(protect, stallOrAdmin, checkStallLock, deleteStallMango);

module.exports = router;
