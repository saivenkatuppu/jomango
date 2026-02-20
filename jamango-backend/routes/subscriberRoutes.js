const express = require('express');
const router = express.Router();
const { subscribeUser, getSubscribers, addContact } = require('../controllers/subscriberController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(subscribeUser).get(protect, admin, getSubscribers);
router.route('/add').post(protect, admin, addContact);

module.exports = router;
