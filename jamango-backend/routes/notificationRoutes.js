const express = require('express');
const router = express.Router();
const { triggerProductNotification, getNotificationLogs } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/trigger', protect, admin, triggerProductNotification);
router.get('/', protect, admin, getNotificationLogs);

module.exports = router;
