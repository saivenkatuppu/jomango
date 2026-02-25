const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff,
    impersonateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);

// Staff management routes
router.route('/staff')
    .get(protect, admin, getStaffs)
    .post(protect, admin, createStaff);

router.route('/staff/:id')
    .put(protect, admin, updateStaff)
    .delete(protect, admin, deleteStaff);

// User access routes
router.post('/:id/impersonate', protect, admin, impersonateUser);

module.exports = router;
