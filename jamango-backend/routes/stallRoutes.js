const express = require('express');
const router = express.Router();
const {
    createStall,
    getStalls,
    getStallById,
    updateStall,
} = require('../controllers/stallController');
const { protect, admin, stallOrAdmin } = require('../middleware/authMiddleware');

// Middleware to check if user is admin or staff (if needed for list)
// For stall creation, strictly admin.
router.route('/')
    .post(protect, admin, createStall)
    .get(protect, admin, getStalls);

router.route('/:id')
    .get(protect, stallOrAdmin, getStallById)
    .put(protect, admin, updateStall);

module.exports = router;
