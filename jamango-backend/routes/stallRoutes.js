const express = require('express');
const router = express.Router();
const {
    createStall,
    getStalls,
    getStallById,
    updateStall,
    deleteStall,
    toggleStallLock,
} = require('../controllers/stallController');
const { protect, admin, stallOrAdmin } = require('../middleware/authMiddleware');

// Middleware to check if user is admin or staff (if needed for list)
// For stall creation, strictly admin.
router.route('/')
    .post(protect, admin, createStall)
    .get(protect, admin, getStalls);

router.route('/:id')
    .get(protect, stallOrAdmin, getStallById)
    .put(protect, admin, updateStall)
    .delete(protect, admin, deleteStall);

router.put('/:id/lock', protect, admin, toggleStallLock);

module.exports = router;
